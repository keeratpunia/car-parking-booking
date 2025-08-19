import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as client from "../api/client";
import { useToast } from "../components/ToastProvider";
import LoadingButton from "../components/LoadingButton";

export default function AdminLocations() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const toast = useToast();

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newAddr, setNewAddr] = useState("");
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await client.adminLocationsApi.list();
      setLocations(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      toast.error(e.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (!isAdmin) return <div className="page"><h1>Admin</h1><p>Admins only.</p></div>;

  async function addLocation(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await client.adminLocationsApi.create({ name: newName, address: newAddr });
      toast.success("Location created");
      setNewName("");
      setNewAddr("");
      await load();
    } catch (e) {
      toast.error(e.message || "Add location failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeLocation(locId) {
    if (!confirm("Delete this location?")) return;
    setRemovingId(locId);
    try {
      await client.adminLocationsApi.remove(locId);
      toast.info("Location deleted");
      await load();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="page">
      <h1>Admin · Locations</h1>

      <form onSubmit={addLocation} className="card">
        <h3>Add Location</h3>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
          placeholder="Location Name"
        />
        <input
          value={newAddr}
          onChange={e => setNewAddr(e.target.value)}
          required
          placeholder="Address"
        />
        <LoadingButton type="submit" loading={saving}>
          Add
        </LoadingButton>
      </form>

      {loading && <p>Loading…</p>}
      {!loading && locations.length === 0 && <p>No locations yet.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {locations.map(loc => (
          <div key={loc._id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>{loc.name}</b>
                <div>{loc.address}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/admin/locations/${loc._id}/slots`}>Manage Slots</Link>
                <LoadingButton
                  loading={removingId === loc._id}
                  onClick={() => removeLocation(loc._id)}
                  style={{ background: "#b00", color: "#fff" }}
                >
                  Delete
                </LoadingButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
