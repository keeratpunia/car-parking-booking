import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const nav = useNavigate();
  const isAdmin = isAuthed && user?.role === "admin";

  function doLogout() {
    logout();
    nav("/");
  }

  const link = ({ isActive }) => ({
    marginRight: 16,
    textDecoration: "none",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "var(--linkActive, #1a8d3c)" : "inherit",
  });

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderBottom: "1px solid #eee",
      }}
    >
      {/* Left side: brand + nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link
          to="/"
          className="brand"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "800",
            letterSpacing: "-0.02em",
            fontSize: "18px",
          }}
        >
          CarParking
        </Link>

        <nav>
          <NavLink to="/" style={link}>
            Home
          </NavLink>
          <NavLink to="/dashboard" style={link}>
            Dashboard
          </NavLink>

          {!isAdmin && (
            <NavLink to="/my-bookings" style={link}>
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" style={link}>
              Admin
            </NavLink>
          )}
        </nav>
      </div>

      {/* Right side: auth controls */}
      <div>
        {isAuthed ? (
          <>
            <span style={{ marginRight: 12 }}>
              Hi, {user?.name || user?.email} ({user?.role})
            </span>
            <button
              onClick={doLogout}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
