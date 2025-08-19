import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await signup(name, email, password);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message || "Signup failed");
    }
  }

  return (
    <div className="page">
      <h1>Signup</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Name<input value={name} onChange={(e)=>setName(e.target.value)} required /></label>
        <label>Email<input value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>
        {err && <div className="error">{err}</div>}
        <button type="submit">Create account</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
