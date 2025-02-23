// Firebase Admin Setup for Firestore
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: ['https://www.phuturesync.co.za', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const insightsRoutes = require("./routes/insights");

// Use Routes
app.use("/auth", authRoutes);
app.use("/api/insights", insightsRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "PhutureSync API is running",
    version: "1.0.0"
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on https://api.phuturesync.co.za:${PORT}`);
});
