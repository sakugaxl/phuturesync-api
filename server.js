require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeFirebaseApp } = require("./utils/firebase");

const PORT = process.env.PORT || 4040;

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "https://www.phuturesync.co.za" }));

// Initialize Firebase
initializeFirebaseApp();

// Import Routes
const authRoutes = require("./routes/auth");
const insightsRoutes = require("./routes/insights");

// Route Middlewares
app.use("/auth", authRoutes);
app.use("/api/insights", insightsRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("Server is running on api.phuturesync.co.za");
});

// Catch-All 404 Route (for undefined routes)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handling Middleware (catches any errors thrown by the routes)
app.use((err, req, res, next) => {
  console.error("❌ Server Error: ", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server (for local testing)
if (!process.env.VERCEL) {
  app.listen(PORT, (err) => {
    if (err) console.error(err);
    console.log("🚀 Server is running on PORT", PORT);
  });
}

// Export for Vercel
module.exports = app;
