import React, { useEffect, useState } from "react";
import * as client from "../api/client";
import { Link } from "react-router-dom";

export default function Locations() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // tweak if you want
  const [data, setData] = useState({ items: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load(p = page, query = q) {
    setLoading(true);
    setErr("");
    try {
      // backend returns { items, page, limit, total, pages }
      const res = await client.api.get(
        `/locations?q=${encodeURIComponent(query)}&page=${p}&limit=${limit}`
      );
      setData({
        items: Array.isArray(res) ? res : res.items || [],
        total: res.total ?? 0,
        pages: res.pages ?? 1,
        page: res.page ?? p,
      });
      setPage(res.page ?? p);
    } catch (e) {
      setErr(e.message || "Failed to load locations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, ""); }, []); // initial

  function onSearch() {
    setPage(1);
    load(1, q);
  }

  function prevPage() {
    if (page > 1) load(page - 1, q);
  }
  function nextPage() {
    if (page < data.pages) load(page + 1, q);
  }

  return (
    <div className="page">
      <h1>Locations</h1>

      {/* Search */}
      <div className="card" style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <label>
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: Sector 17, Chandigarh…"
          />
        </label>
        <button onClick={onSearch}>Search</button>
      </div>

      {/* List */}
      {loading && <p>Loading…</p>}
      {err && <p className="error">{err}</p>}
      {!loading && !err && data.items.length === 0 && <p>No locations found.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {data.items.map((loc) => (
          <div key={loc._id} className="card">
            <h3 style={{ marginTop: 0 }}>{loc.name}</h3>
            <div style={{ opacity: 0.8 }}>{loc.address}</div>
            <div style={{ margin: "6px 0" }}>₹{loc.pricePerMinute}/min</div>
            <Link to={`/locations/${loc._id}`}>View</Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
          <button onClick={prevPage} disabled={page <= 1}>
            ◀ Prev
          </button>
          <span>
            Page {page} of {data.pages} &middot; {data.total} results
          </span>
          <button onClick={nextPage} disabled={page >= data.pages}>
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
