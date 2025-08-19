import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as client from "../api/client";
import { useToast } from "../components/ToastProvider";
import LoadingButton from "../components/LoadingButton";

function fmt(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}

export default function AdminBookings() {
  const { user, isAuthed } = useAuth();
  const isAdmin = isAuthed && user?.role === "admin";
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [locs, setLocs] = useState([]);
  const [filters, setFilters] = useState({ locationId: "", status: "", from: "", to: "" });
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  const qs = useMemo(() => ({
    locationId: filters.locationId,
    status: filters.status,
    from: filters.from ? new Date(filters.from).toISOString() : "",
    to: filters.to ? new Date(filters.to).toISOString() : ""
  }), [filters]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const data = await client.adminLocationsApi.list();
        const arr = Array.isArray(data) ? data : data.items || [];
        setLocs(arr.filter(l => l.isActive !== false));
      } catch(e) { /* ignore */ }
    })();
  }, [isAdmin]);

  async function load() {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await client.adminBookingsApi.list(qs);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* on mount */ }, []); // eslint-disable-line

  if (!isAdmin) return <div className="page"><h1>Admin</h1><p>Admins only.</p></div>;

  async function onCancel(id) {
    if (!confirm("Cancel this future booking?")) return;
    setCancelingId(id);
    try {
      await client.adminBookingsApi.cancel(id);
      toast.info("Booking cancelled");
      await load();
    } catch (e) {
      toast.error(e.message || "Cancel failed");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="page">
      <h1>Admin · Bookings</h1>

      {/* Filters */}
      <div className="card">
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            Location
            <select
              value={filters.locationId}
              onChange={(e)=>setFilters(f=>({ ...f, locationId: e.target.value }))}
            >
              <option value="">All</option>
              {locs.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
          </label>
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e)=>setFilters(f=>({ ...f, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            From (local)
            <input
              type="datetime-local"
              value={filters.from}
              onChange={(e)=>setFilters(f=>({ ...f, from: e.target.value }))}
            />
          </label>
          <label>
            To (local)
            <input
              type="datetime-local"
              value={filters.to}
              onChange={(e)=>setFilters(f=>({ ...f, to: e.target.value }))}
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={load}>Apply Filters</button>
            <button onClick={()=>{ setFilters({ locationId:"", status:"", from:"", to:"" }); setTimeout(load, 0); }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No bookings found.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map(b => (
          <div key={b._id} className="card">
            <div style={{ display: "grid", gap: 4 }}>
              <div>
                <b>User:</b>{" "}
                {b.userId?.name || b.userId?.email
                  ? `${b.userId?.name ?? ""}${b.userId?.name && b.userId?.email ? " • " : ""}${b.userId?.email ?? ""}`
                  : b.userId}
              </div>
              <div><b>Location:</b> {b.locationId?.name || b.locationId}</div>
              <div><b>Slot:</b> {b.slotId?.label || b.slotId}</div>
              <div><b>Time:</b> {fmt(b.startTime)} → {fmt(b.endTime)}</div>
              <div><b>Price:</b> ₹{b.totalPrice} ({b.durationMinutes} min @ ₹{b.pricePerMinuteSnapshot}/min)</div>
              <div><b>Status:</b> {b.status}</div>
            </div>
            {b.status === "confirmed" && (
              <div style={{ marginTop: 8 }}>
                <LoadingButton
                  loading={cancelingId === b._id}
                  onClick={()=>onCancel(b._id)}
                  style={{ background:"#b00", color:"#fff" }}
                >
                  Cancel
                </LoadingButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
