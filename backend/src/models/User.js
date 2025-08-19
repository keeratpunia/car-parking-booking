const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "owner", "admin"], default: "user", index: true, required: true }
  },
  { timestamps: true }
);

// userSchema.index({ email: 1 }, { unique: true });

module.exports = model("User", userSchema);
