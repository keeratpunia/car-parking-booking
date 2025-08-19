const { Schema, model } = require("mongoose");

const slotSchema = new Schema(
  {
    locationId: { type: Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    label: { type: String, required: true, minlength: 1, maxlength: 10, trim: true },
    isActive: { type: Boolean, default: true },
    notes: { type: String, maxlength: 200 }
  },
  { timestamps: true }
);

// unique per location
slotSchema.index({ locationId: 1, label: 1 }, { unique: true });

module.exports = model("Slot", slotSchema);
