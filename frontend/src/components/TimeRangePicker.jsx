import React from "react";

// Convert local "YYYY-MM-DDTHH:mm" to ISO string with Z
export function toISO(localValue) {
  if (!localValue) return "";
  const d = new Date(localValue);
  return d.toISOString();
}

export default function TimeRangePicker({ start, end, onChange }) {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <label>
        Start time (local)
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => onChange({ start: e.target.value, end })}
          required
        />
      </label>
      <label>
        End time (local)
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => onChange({ start, end: e.target.value })}
          required
        />
      </label>
      
    </div>
  );
}
