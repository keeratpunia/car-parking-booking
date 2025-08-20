const express = require("express");
const { z } = require("zod");
const Location = require("../models/Location");
const { auth } = require("../middleware/auth");
const { canManageLocation } = require("../middleware/ownership");

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(3).max(80),
  address: z.string().min(5).max(200),
  description: z.string().max(500).optional(),
  pricePerMinute: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

// PUBLIC list
router.get("/", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const hasIsActive = typeof req.query.isActive !== "undefined";
  const isActive = req.query.isActive === "true" ? true
                 : req.query.isActive === "false" ? false
                 : undefined;

  const minPrice = Number.isFinite(Number(req.query.minPrice)) ? Number(req.query.minPrice) : 0;
  const maxPrice = Number.isFinite(Number(req.query.maxPrice)) ? Number(req.query.maxPrice) : Number.MAX_SAFE_INTEGER;

  const filter = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { address: { $regex: q, $options: "i" } },
    ];
  }
  filter.pricePerMinute = { $gte: minPrice, $lte: maxPrice };
  filter.isActive = hasIsActive ? isActive : true;

  const [items, total] = await Promise.all([
    Location.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Location.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

// PUBLIC read-one (only active)
router.get("/:id", async (req, res) => {
  const item = await Location.findById(req.params.id);
  if (!item || !item.isActive) return res.status(404).json({ message: "Location not found" });
  res.json(item);
});

// ADMIN create — ownerId = this admin
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const parsed = createSchema.safeParse({
    ...req.body,
    pricePerMinute: Number(req.body.pricePerMinute),
  });
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const item = await Location.create({
    name: parsed.data.name,
    address: parsed.data.address,
    description: parsed.data.description || "",
    pricePerMinute: parsed.data.pricePerMinute,
    isActive: typeof parsed.data.isActive === "boolean" ? parsed.data.isActive : true,
    ownerId: req.user.id,         // 👈 tie to this admin
    createdBy: req.user.id,
  });
  res.status(201).json(item);
});

// ADMIN (own locations) update
router.patch("/:id", auth, canManageLocation, async (req, res) => {
  const parsed = updateSchema.safeParse({
    ...req.body,
    pricePerMinute: typeof req.body.pricePerMinute === "undefined"
      ? undefined
      : Number(req.body.pricePerMinute),
  });
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const updated = await Location.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!updated) return res.status(404).json({ message: "Location not found" });
  res.json(updated);
});

// ADMIN (own locations) soft delete
router.delete("/:id", auth, canManageLocation, async (req, res) => {
  const item = await Location.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Location not found" });
  item.isActive = false;
  await item.save();
  res.json(item);
});

module.exports = router;
