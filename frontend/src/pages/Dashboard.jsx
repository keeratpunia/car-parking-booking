import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="card">
        <p><b>Name:</b> {user?.name || "-"}</p>
        <p><b>Email:</b> {user?.email || "-"}</p>
        <p><b>Role:</b> {user?.role}</p>
      </div>

      {!isAdmin && (
        <>
          {/* User controls */}
          <div className="card">
            <h2>My Bookings</h2>
            <p>See and cancel upcoming bookings.</p>
            <Link className="button" to="/my-bookings">Go to My Bookings</Link>
          </div>

          <div className="card">
            <h2>Browse Locations</h2>
            <p>Find a parking location and book a slot.</p>
            {/* 👇 changed from "/" to "/locations" */}
            <Link className="button" to="/locations">Browse Locations</Link>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          {/* Admin quick links */}
          <div className="card">
            <h2>Admin: Locations</h2>
            <p>Create, edit, and manage slots for your locations.</p>
            <Link className="button" to="/admin/locations">Manage Locations</Link>
          </div>

          <div className="card">
            <h2>Admin: Bookings</h2>
            <p>View and filter all bookings.</p>
            <Link className="button" to="/admin/bookings">Manage Bookings</Link>
          </div>
        </>
      )}
    </div>
  );
}
