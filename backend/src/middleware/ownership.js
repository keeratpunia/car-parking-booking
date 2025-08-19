const Location = require("../models/Location");

// Admins can manage ONLY locations they created (ownerId == admin's id).
// Users cannot manage locations.
async function canManageLocation(req, res, next) {
  try {
    const { id, locationId } = req.params;
    const locId = locationId || id || req.body.locationId || req.query.locationId;
    if (!locId) return res.status(400).json({ message: "locationId required" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const loc = await Location.findById(locId).select("ownerId");
    if (!loc) return res.status(404).json({ message: "Location not found" });

    if (String(loc.ownerId) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden (not your location)" });
    }

    return next();
  } catch (e) {
    next(e);
  }
}

module.exports = { canManageLocation };
