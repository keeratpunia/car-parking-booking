import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

/* Pages */
import Home from "./pages/Home";                 // ✅ fancy landing
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Locations from "./pages/Locations";
import LocationDetail from "./pages/LocationDetail";
import MyBookings from "./pages/MyBookings";
import AdminLocations from "./pages/AdminLocations";
import AdminBookings from "./pages/AdminBookings";

/* -------- Small inline bits -------- */

function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Page not found.</p>
      <a className="btn btn-outline" href="/">Go Home</a>
    </div>
  );
}

/** Admin-only guard. Redirects:
 *  - unauthenticated -> /login
 *  - non-admin users -> /dashboard
 */
function AdminRoute({ children }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

/* ---------------------- App ----------------------- */

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User-protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        {/* Public booking flow */}
        <Route path="/locations" element={<Locations />} />
        <Route path="/locations/:id" element={<LocationDetail />} />

        {/* Admin area */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              {/* Send admins to their main workspace */}
              <Navigate to="/admin/locations" replace />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/locations"
          element={
            <AdminRoute>
              <AdminLocations />
            </AdminRoute>
          }
        />

        {/* This route stays to keep existing links working.
            Slot management is inline on AdminLocations now. */}
        <Route
          path="/admin/locations/:id/slots"
          element={
            <AdminRoute>
              <AdminLocations />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}












// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
