const express = require("express");
const { z } = require("zod");
const Location = require("../models/Location");
const { auth, adminOnly } = require("../middleware/auth");

const router = express.Router();

/**
 * Helpers
 */
function toInt(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

function buildRegex(q) {
  // case-insensitive partial match on name/address
  return { $regex: q, $options: "i" };
}

/**
 * Validation
 */
const createSchema = z.object({
  name: z.string().min(3).max(80),
  address: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  pricePerMinute: z.number().int().positive(),
  isActive: z.boolean().optional(),
  // Admin may optionally specify an ownerId; owners cannot.
  ownerId: z.string().optional(),
});

const updateSchema = createSchema.partial();

/**
 * PUBLIC LIST with filters & pagination
 * GET /api/locations?q=&isActive=&minPrice=&maxPrice=&page=&limit=
 */
router.get("/", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const hasIsActive = typeof req.query.isActive !== "undefined";
  const isActive = req.query.isActive === "true" ? true
                 : req.query.isActive === "false" ? false
                 : undefined;
  const minPrice = Number.isFinite(Number(req.query.minPrice)) ? Number(req.query.minPrice) : 0;
  const maxPrice = Number.isFinite(Number(req.query.maxPrice)) ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;
  const page = Math.max(toInt(req.query.page, 1), 1);
  const limit = Math.min(50, Math.max(toInt(req.query.limit, 10), 1));
  const skip = (page - 1) * limit;

  const filter = {};
  if (q) {
    filter.$or = [
      { name: buildRegex(q) },
      { address: buildRegex(q) },
    ];
  }
  if (hasIsActive) {
    filter.isActive = isActive;
  } else {
    // By default, show only active locations to public users
    filter.isActive = true;
  }
  filter.pricePerMinute = { $gte: minPrice, $lte: maxPrice };

  const [items, total] = await Promise.all([
    Location.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Location.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

/**
 * GET /api/locations/:id (public read, but only active)
 */
router.get("/:id", async (req, res) => {
  const item = await Location.findById(req.params.id);
  if (!item || !item.isActive) return res.status(404).json({ message: "Location not found" });
  res.json(item);
});

/**
 * CREATE location
 * - owner: can create only with themselves as ownerId
 * - admin: can set ownerId (or defaults to themselves)
 */
router.post("/", auth, async (req, res) => {
  const parsed = createSchema.safeParse({
    ...req.body,
    pricePerMinute: Number(req.body.pricePerMinute),
  });
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  let ownerId;
  if (req.user.role === "owner") {
    ownerId = req.user.id; // force self
  } else if (req.user.role === "admin") {
    ownerId = parsed.data.ownerId || req.user.id; // admin can choose or default to self
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  const item = await Location.create({
    name: parsed.data.name,
    address: parsed.data.address,
    description: parsed.data.description || "",
    pricePerMinute: parsed.data.pricePerMinute,
    isActive: typeof parsed.data.isActive === "boolean" ? parsed.data.isActive : true,
    ownerId,
    createdBy: req.user.id,
  });
  res.status(201).json(item);
});

/**
 * UPDATE location
 * - admin: any
 * - owner: only their own locations
 */
router.patch("/:id", auth, async (req, res) => {
  const parsed = updateSchema.safeParse({
    ...req.body,
    pricePerMinute: typeof req.body.pricePerMinute === "undefined"
      ? undefined
      : Number(req.body.pricePerMinute),
  });
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const loc = await Location.findById(req.params.id);
  if (!loc) return res.status(404).json({ message: "Location not found" });

  if (req.user.role === "owner" && String(loc.ownerId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden (not your location)" });
  }
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Owners cannot reassign ownerId via update
  const updateDoc = { ...parsed.data };
  if (req.user.role === "owner") {
    delete updateDoc.ownerId;
  }

  const updated = await Location.findByIdAndUpdate(req.params.id, updateDoc, { new: true });
  res.json(updated);
});

/**
 * SOFT DELETE (isActive = false)
 * - admin: any
 * - owner: only their own
 */
router.delete("/:id", auth, async (req, res) => {
  const loc = await Location.findById(req.params.id);
  if (!loc) return res.status(404).json({ message: "Location not found" });

  if (req.user.role === "owner" && String(loc.ownerId) !== req.user.id) {
    return res.status(403).json({ message: "Forbidden (not your location)" });
  }
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  loc.isActive = false;
  await loc.save();
  res.json(loc);
});

module.exports = router;
