const express = require("express");
const { z } = require("zod");
const { availableSlots } = require("../services/availability");

const router = express.Router();

// Expect ISO 8601 datetimes, e.g. 2025-08-20T10:00:00.000Z
const querySchema = z.object({
  locationId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime()
});

router.get("/availability", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  try {
    const { location, slots } = await availableSlots(
      parsed.data.locationId,
      parsed.data.startTime,
      parsed.data.endTime
    );
    res.json({
      location: { _id: location._id, name: location.name, pricePerMinute: location.pricePerMinute },
      availableSlots: slots
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
