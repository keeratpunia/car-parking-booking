const { Schema, model } = require("mongoose");

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: "Location", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true },
    pricePerMinuteSnapshot: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed", index: true }
  },
  { timestamps: true }
);

// Helpful for overlap searches on a specific slot
bookingSchema.index({ slotId: 1, startTime: 1, endTime: 1 });

module.exports = model("Booking", bookingSchema);
