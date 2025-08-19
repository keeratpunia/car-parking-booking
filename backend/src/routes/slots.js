const express = require("express");
const { z } = require("zod");
const Slot = require("../models/Slot");
const Location = require("../models/Location");
const { auth } = require("../middleware/auth");
const { canManageLocation } = require("../middleware/ownership");

const router = express.Router();

const createSchema = z.object({
  label: z.string().min(1).max(10),
  isActive: z.boolean().optional(),
  notes: z.string().max(200).optional(),
});
const updateSchema = createSchema.partial();

// ------------------------------
// Public: list slots for a location
// GET /api/locations/:locationId/slots?isActive=true
// ------------------------------
router.get("/locations/:locationId/slots", async (req, res) => {
  const filter = { locationId: req.params.locationId };
  if (typeof req.query.isActive !== "undefined") {
    filter.isActive = req.query.isActive === "true";
  }
  const slots = await Slot.find(filter).sort({ label: 1 });
  res.json(slots);
});

// ------------------------------
// Owner/Admin: create slot for a location (ownership enforced)
// POST /api/locations/:locationId/slots
// ------------------------------
router.post("/locations/:locationId/slots", auth, canManageLocation, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const loc = await Location.findById(req.params.locationId);
  if (!loc || !loc.isActive) return res.status(404).json({ message: "Location not found" });

  try {
    const slot = await Slot.create({ locationId: loc._id, ...parsed.data });
    res.status(201).json(slot);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Slot label already exists for this location" });
    }
    throw e;
  }
});

// Helper: load slot by :id and attach its locationId to req.params
async function attachLocationFromSlot(req, res, next) {
  const slot = await Slot.findById(req.params.id).select("locationId");
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  // inject for canManageLocation to authorize owners against the parent location
  req.params.locationId = String(slot.locationId);
  return next();
}

// ------------------------------
// Owner/Admin: update slot (ownership enforced via parent location)
// PATCH /api/slots/:id
// ------------------------------
router.patch("/slots/:id", auth, attachLocationFromSlot, canManageLocation, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const updated = await Slot.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
    if (!updated) return res.status(404).json({ message: "Slot not found" });
    res.json(updated);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Slot label already exists for this location" });
    }
    throw e;
  }
});

// ------------------------------
// Owner/Admin: soft delete slot (set isActive=false)
// DELETE /api/slots/:id
// ------------------------------
router.delete("/slots/:id", auth, attachLocationFromSlot, canManageLocation, async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  slot.isActive = false;
  await slot.save();
  res.json(slot);
});

module.exports = router;
