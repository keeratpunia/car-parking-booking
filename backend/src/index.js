require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./db");
const { StatusCodes } = require("http-status-codes");
const authRouter = require("./routes/auth");
const locationsRouter = require("./routes/locations");
const slotsRouter = require("./routes/slots");
const availabilityRouter = require("./routes/availability");
const bookingsRouter = require("./routes/bookings");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/locations", locationsRouter);
app.use("/api", slotsRouter);
app.use("/api", availabilityRouter);
app.use("/api", bookingsRouter);


app.get("/health", (_req, res) => {
  res.status(StatusCodes.OK).json({ ok: true, service: "parking-api" });
});

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
