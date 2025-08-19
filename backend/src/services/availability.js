const Booking = require("../models/Booking");
const Location = require("../models/Location");
const Slot = require("../models/Slot");

// intervals [s1,e1) and [s2,e2) overlap if s1 < e2 && s2 < e1
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Find slotIds that are unavailable in [start, end)
async function getUnavailableSlotIds(locationId, start, end) {
  // Any confirmed booking whose range overlaps our range
  const bookings = await Booking.find({
    locationId,
    status: "confirmed",
    startTime: { $lt: end },
    endTime: { $gt: start }
  }).select("slotId");

  return new Set(bookings.map((b) => String(b.slotId)));
}

async function availableSlots(locationId, startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  if (Number.isNaN(start.getTime())) throw new Error("Invalid startTime");
  if (Number.isNaN(end.getTime())) throw new Error("Invalid endTime");
  if (end <= start) throw new Error("endTime must be after startTime");

  const location = await Location.findById(locationId);
  if (!location || !location.isActive) throw new Error("Location not found/inactive");

  // Only active slots are candidates
  const allSlots = await Slot.find({ locationId, isActive: true }).sort({ label: 1 });

  // Which slots are blocked by bookings in this range?
  const unavailable = await getUnavailableSlotIds(locationId, start, end);

  // Filter out the blocked ones
  const available = allSlots.filter((s) => !unavailable.has(String(s._id)));

  return { location, slots: available };
}

module.exports = { overlaps, availableSlots };
