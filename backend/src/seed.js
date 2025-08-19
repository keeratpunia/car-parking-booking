require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("./db");
const User = require("./models/User");

(async function seed() {
  await connectDB(process.env.MONGODB_URI);

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const name = process.env.ADMIN_NAME || "Admin";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(password, 10);

  const upd = await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, role: "admin" } },
    { new: true, upsert: true }
  );

  console.log("✅ Admin ensured:", upd.email);
  console.log("🔑 Current password:", password);
  process.exit(0);
})();
