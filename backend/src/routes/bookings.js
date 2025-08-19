const express = require("express");
const { z } = require("zod");
const { auth } = require("../middleware/auth");
const Booking = require("../models/Booking");
const Location = require("../models/Location");
const Slot = require("../models/Slot");

const router = express.Router();

const createSchema = z.object({
  locationId: z.string().min(1),
  slotId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

function ceilMinutes(ms) { return Math.ceil(ms / 60000); }

// my bookings (user)
router.get("/bookings/my", auth, async (req, res) => {
  const items = await Booking.find({ userId: req.user.id })
    .sort({ startTime: -1 })
    .populate("locationId", "name")
    .populate("slotId", "label");
  res.json(items);
});

// create
router.post("/bookings", auth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { locationId, slotId, startTime, endTime } = parsed.data;
  const start = new Date(startTime), end = new Date(endTime);

  if (start < new Date(Date.now() + 5 * 60 * 1000)) return res.status(400).json({ message: "startTime must be at least 5 minutes from now" });
  if (end <= start) return res.status(400).json({ message: "endTime must be after startTime" });

  const duration = ceilMinutes(end - start);
  if (duration < 15 || duration > 12 * 60) return res.status(400).json({ message: "duration must be 15m–12h" });

  const location = await Location.findById(locationId);
  if (!location || !location.isActive) return res.status(400).json({ message: "Invalid location" });

  const slot = await Slot.findById(slotId);
  if (!slot || !slot.isActive || String(slot.locationId) !== String(location._id)) {
    return res.status(400).json({ message: "Invalid slot" });
  }

  const conflict = await Booking.exists({
    slotId,
    status: "confirmed",
    startTime: { $lt: end },
    endTime: { $gt: start },
  });
  if (conflict) return res.status(409).json({ message: "Overlap detected for this slot/time" });

  const pricePerMinuteSnapshot = location.pricePerMinute;
  const totalPrice = duration * pricePerMinuteSnapshot;

  const booking = await Booking.create({
    userId: req.user.id,
    locationId: location._id,
    slotId: slot._id,
    startTime: start,
    endTime: end,
    durationMinutes: duration,
    pricePerMinuteSnapshot,
    totalPrice,
    status: "confirmed",
  });

  res.status(201).json(booking);
});

// cancel (future). allowed if: user owns booking, or admin owns the booking's location
router.patch("/bookings/:id/cancel", auth, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const isOwnBooking = String(booking.userId) === req.user.id;
  let adminOwnsLocation = false;

  if (req.user.role === "admin") {
    const loc = await Location.findById(booking.locationId).select("ownerId");
    if (loc && String(loc.ownerId) === req.user.id) adminOwnsLocation = true;
  }

  if (!(isOwnBooking || adminOwnsLocation)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (booking.startTime <= new Date()) {
    return res.status(400).json({ message: "Cannot cancel past/ongoing booking" });
  }

  booking.status = "cancelled";
  await booking.save();
  res.json(booking);
});

// admin list: only bookings for locations owned by this admin
router.get("/bookings", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const filter = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.startTime = {};
    if (req.query.from) filter.startTime.$gte = new Date(req.query.from);
    if (req.query.to) filter.startTime.$lte = new Date(req.query.to);
  }

  // scope to this admin's locations
  const ownLocs = await Location.find({ ownerId: req.user.id }).select("_id");
  const ownIds = ownLocs.map(l => String(l._id));

  if (req.query.locationId) {
    if (!ownIds.includes(String(req.query.locationId))) return res.json([]);
    filter.locationId = req.query.locationId;
  } else {
    filter.locationId = { $in: ownIds };
  }

  const items = await Booking.find(filter)
    .sort({ startTime: -1 })
    .populate("userId", "name email")
    .populate("locationId", "name")
    .populate("slotId", "label");

  res.json(items);
});

module.exports = router;
