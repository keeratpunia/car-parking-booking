import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { isAuthed, user } = useAuth();
  const isAdmin = isAuthed && user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="page">
        <h1>Admin</h1>
        <p>Admins only.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Admin</h1>
      <p style={{ marginTop: -6, color: "#666" }}>
        Manage your locations and bookings.
      </p>

      <div style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        marginTop: 16
      }}>
        <AdminTile
          title="Locations"
          desc="Create & edit locations. Add/disable slots for each location."
          to="/admin/locations"
          cta="Manage Locations"
        />
        <AdminTile
          title="Bookings"
          desc="Search bookings by location/status/time and cancel future ones."
          to="/admin/bookings"
          cta="View Bookings"
        />
      </div>
    </div>
  );
}

function AdminTile({ title, desc, to, cta }) {
  return (
    <div className="card" style={{ display: "grid", gap: 8 }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ margin: 0 }}>{desc}</p>
      <Link to={to} className="btn" style={{ marginTop: 4 }}>{cta}</Link>
    </div>
  );
}
