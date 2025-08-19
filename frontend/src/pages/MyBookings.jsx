import React, { useEffect, useState } from "react";
import * as client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import LoadingButton from "../components/LoadingButton";

function fmt(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}
function isFuture(dateStr) {
  return new Date(dateStr).getTime() > Date.now();
}

export default function MyBookings() {
  const { isAuthed } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await client.bookingsApi.my();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return; }
    load();
  }, [isAuthed]); // eslint-disable-line

  async function onCancel(id) {
    if (!confirm("Cancel this future booking?")) return;
    setCancelingId(id);
    try {
      await client.bookingsApi.cancel(id);
      toast.info("Booking cancelled");
      await load();
    } catch (e) {
      toast.error(e.message || "Cancel failed");
    } finally {
      setCancelingId(null);
    }
  }

  if (!isAuthed) {
    return (
      <div className="page">
        <h1>My Bookings</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Bookings</h1>

      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No bookings yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((b) => {
          const canCancel = b.status === "confirmed" && isFuture(b.startTime);
          return (
            <div key={b._id} className="card">
              <p><b>Status:</b> {b.status}</p>
              <p><b>Location:</b> {b.locationId?.name || b.locationId}</p>
              <p><b>Slot:</b> {b.slotId?.label || b.slotId}</p>
              <p><b>Time:</b> {fmt(b.startTime)} → {fmt(b.endTime)}</p>
              <p><b>Price:</b> ₹{b.totalPrice} ({b.durationMinutes} min @ ₹{b.pricePerMinuteSnapshot}/min)</p>

              {canCancel && (
                <div style={{ marginTop: 8 }}>
                  <LoadingButton
                    loading={cancelingId === b._id}
                    onClick={() => onCancel(b._id)}
                    style={{ background: "#b00", color: "#fff" }}
                  >
                    Cancel Booking
                  </LoadingButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
