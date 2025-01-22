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

app.use(cors({ origin: "https://www.phuturesync.co.za" })); // Updated to production URL
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const insightsRoutes = require("./routes/insights");

// Use Routes
app.use("/auth", authRoutes);
app.use("/api/insights", insightsRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running on panel.phuturesync.co.za");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on https://panel.phuturesync.co.za:${PORT}`);
});
