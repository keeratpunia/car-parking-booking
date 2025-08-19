const { Schema, model } = require("mongoose");

const locationSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 80, trim: true },
    address: { type: String, required: true, minlength: 5, maxlength: 200, trim: true },
    description: { type: String, maxlength: 500 },
    pricePerMinute: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// locationSchema.index({ name: "text", address: "text" });
locationSchema.index({ name: 1, address: 1 });

module.exports = model("Location", locationSchema);
