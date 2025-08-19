import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import * as client from "../api/client";
import LoadingButton from "../components/LoadingButton";
import { useToast } from "../components/ToastProvider";

const emptyForm = { name: "", address: "", pricePerMinute: 1, description: "" };

export default function AdminLocations() {
  const { user, isAuthed } = useAuth();
  const toast = useToast();
  const isAdmin = isAuthed && user?.role === "admin";

  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // Slot panel state
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newSlotLabel, setNewSlotLabel] = useState("");
  const [addingSlot, setAddingSlot] = useState(false);
  const [busySlotId, setBusySlotId] = useState("");

  // ---------- Locations ----------
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.adminLocationsApi.list(q);
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      toast.error(e.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }, [q, toast]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  if (!isAdmin) {
    return <div className="page"><h1>Admin</h1><p>Admins only.</p></div>;
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description?.trim(),
        pricePerMinute: Number(form.pricePerMinute),
      };
      if (editingId) {
        await client.adminLocationsApi.update(editingId, payload);
        toast.success("Location updated");
      } else {
        const created = await client.adminLocationsApi.create(payload);
        toast.success("Location created");
        // jump into edit mode so you can add slots immediately
        setEditingId(created._id);
      }
      setForm(emptyForm);
      await load();
    } catch (e) {
      toast.error(e.message || "Save failed");
    }
  }

  function onEdit(loc) {
    setEditingId(loc._id);
    setForm({
      name: loc.name,
      address: loc.address,
      description: loc.description || "",
      pricePerMinute: loc.pricePerMinute,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDeactivateLocation(id) {
    if (!confirm("Deactivate this location? (Soft delete)")) return;
    try {
      await client.adminLocationsApi.softDelete(id);
      toast.info("Location deactivated");
      if (editingId === id) {
        setEditingId(null);
        setSlots([]);
      }
      await load();
    } catch (e) {
      toast.error(e.message || "Deactivate failed");
    }
  }

  // ---------- Slots (inline while editing) ----------
  const loadSlots = useCallback(async () => {
    if (!editingId) return;
    setSlotsLoading(true);
    try {
      const data = await client.adminSlotsApi.list(editingId);
      setSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || "Failed to load slots");
    } finally {
      setSlotsLoading(false);
    }
  }, [editingId, toast]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  async function addSlot(e) {
    e.preventDefault();
    const label = newSlotLabel.trim();
    if (!label) return;
    setAddingSlot(true);
    try {
      await client.adminSlotsApi.create(editingId, { label });
      setNewSlotLabel("");
      toast.success("Slot added");
      await loadSlots();
    } catch (e) {
      toast.error(e.message || "Add slot failed");
    } finally {
      setAddingSlot(false);
    }
  }

  async function setSlotActive(slotId, isActive) {
    if (!isActive && !confirm("Deactivate this slot?")) return;
    setBusySlotId(slotId);
    try {
      await client.adminSlotsApi.update(slotId, { isActive });
      toast.success(isActive ? "Slot activated" : "Slot deactivated");
      await loadSlots();
    } catch (e) {
      toast.error(e.message || (isActive ? "Activate failed" : "Deactivate failed"));
    } finally {
      setBusySlotId("");
    }
  }

  return (
    <div className="page">
      <h1>Admin · Locations</h1>

      {/* Create / Edit form */}
      <form className="card" onSubmit={onSubmit}>
        <h3 style={{ margin: 0 }}>{editingId ? "Edit Location" : "Add Location"}</h3>
        <label>Name
          <input value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} required minLength={3} />
        </label>
        <label>Address
          <input value={form.address} onChange={e=>setForm(f=>({ ...f, address: e.target.value }))} required />
        </label>
        <label>Price per minute
          <input
            type="number"
            min="1"
            step="1"
            value={form.pricePerMinute}
            onChange={e=>setForm(f=>({ ...f, pricePerMinute: e.target.value }))}
            required
          />
        </label>
        <label>Description
          <input value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <LoadingButton type="submit">
            {editingId ? "Save changes" : "Add location"}
          </LoadingButton>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(emptyForm); setSlots([]); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Inline Slot Management when editing */}
      {editingId && (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Slots for this location</h3>

          <form onSubmit={addSlot} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              placeholder="e.g. A1"
              value={newSlotLabel}
              onChange={(e)=>setNewSlotLabel(e.target.value)}
              required
            />
            <LoadingButton type="submit" loading={addingSlot}>Add Slot</LoadingButton>
          </form>

          {slotsLoading && <p>Loading slots…</p>}
          {!slotsLoading && slots.length === 0 && <p>No slots yet.</p>}

          <div style={{ display:"grid", gap:10, marginTop:12 }}>
            {slots.map(s => (
              <div key={s._id} className="card" style={{ padding: 8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <b>{s.label}</b>
                    <div>Status: {s.isActive ? "Active" : "Inactive"}</div>
                  </div>
                  <div>
                    {s.isActive ? (
                      <LoadingButton
                        onClick={() => setSlotActive(s._id, false)}
                        loading={busySlotId === s._id}
                        style={{ background:"#b00", color:"#fff" }}
                      >
                        Deactivate
                      </LoadingButton>
                    ) : (
                      <LoadingButton
                        onClick={() => setSlotActive(s._id, true)}
                        loading={busySlotId === s._id}
                      >
                        Activate
                      </LoadingButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ marginTop: 12 }}>
        <label>Search
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="name/address"/>
        </label>
        <button onClick={load}>Search</button>
      </div>

      {/* List */}
      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No locations.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map(loc => (
          <div key={loc._id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0 }}>{loc.name}</h3>
                <div>{loc.address}</div>
                <div>₹{loc.pricePerMinute}/min</div>
                <div>Status: {loc.isActive ? "Active" : "Inactive"}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onEdit(loc)}>Edit / Manage Slots</button>
                {loc.isActive && (
                  <button
                    onClick={() => onDeactivateLocation(loc._id)}
                    style={{ background: "#b00", color: "#fff" }}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
