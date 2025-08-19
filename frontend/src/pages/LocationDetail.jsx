import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as client from "../api/client"; // <— use namespace import
import TimeRangePicker, { toISO } from "../components/TimeRangePicker";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import LoadingButton from "../components/LoadingButton";

function defaultLocalStartEnd() {
  // set default to today + 1 hour for start, + 2 hours for end
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const toLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { start: toLocal(start), end: toLocal(end) };
}

export default function LocationDetail() {
  const { id } = useParams(); // locationId
  const nav = useNavigate();
  const { isAuthed } = useAuth();
  const toast = useToast();

  const [location, setLocation] = useState(null);
  const [range, setRange] = useState(defaultLocalStartEnd());
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState([]);
  const [submitting, setSubmitting] = useState(null); // slotId being booked

  useEffect(() => {
    (async () => {
      try {
        const loc = await client.locationsApi.get(id);
        setLocation(loc);
      } catch (e) {
        toast.error(e.message || "Failed to load location");
      }
    })();
  }, [id, toast]);

  async function onCheck() {
    setChecking(true);
    try {
      const startISO = toISO(range.start);
      const endISO = toISO(range.end);
      const res = await client.availabilityApi.get({ locationId: id, startTime: startISO, endTime: endISO });
      setAvailable(res.availableSlots || []);
      if ((res.availableSlots || []).length === 0) toast.info("No slots available in this time range.");
    } catch (e) {
      toast.error(e.message || "Failed to check availability");
    } finally {
      setChecking(false);
    }
  }

  async function onBook(slotId) {
    if (!isAuthed) {
      nav("/login");
      return;
    }
    setSubmitting(slotId);
    try {
      const startISO = toISO(range.start);
      const endISO = toISO(range.end);
      const b = await client.bookingsApi.create({
        locationId: id,
        slotId,
        startTime: startISO,
        endTime: endISO,
      });
      toast.success(
        `Booking confirmed! Total ₹${b.totalPrice} (${b.durationMinutes} min @ ₹${b.pricePerMinuteSnapshot}/min)`
      );
      // remove this slot from available list
      setAvailable((prev) => prev.filter((s) => s._id !== slotId));
    } catch (e) {
      toast.error(e.message || "Booking failed");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="page">
      {!location && <p>Loading…</p>}
      {location && (
        <>
          <h1>{location.name}</h1>
          <p>{location.address}</p>
          <p>₹{location.pricePerMinute} per minute</p>

          <TimeRangePicker start={range.start} end={range.end} onChange={setRange} />
          <LoadingButton
            loading={checking}
            onClick={onCheck}
            style={{ marginTop: 12, background: "#2563eb", color: "#fff" }}
          >
            Check Availability
          </LoadingButton>

          {available.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>Available Slots</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                {available.map((s) => (
                  <div className="card" key={s._id}>
                    <div>
                      <b>{s.label}</b>
                    </div>
                    <LoadingButton
                      loading={submitting === s._id}
                      onClick={() => onBook(s._id)}
                      style={{ background: "#16a34a", color: "#fff" }}
                    >
                      Book Now
                    </LoadingButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
