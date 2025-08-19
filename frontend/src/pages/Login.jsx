import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="page">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>
        {err && <div className="error">{err}</div>}
        <button type="submit">Login</button>
      </form>
      <p>No account? <Link to="/signup">Signup</Link></p>
    </div>
  );
}
