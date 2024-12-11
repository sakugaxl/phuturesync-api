require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

let serviceAccount;

// Check for the FIREBASE_SERVICE_ACCOUNT environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error.message);
    process.exit(1); // Exit if the environment variable is not properly formatted
  }
} else {
  console.error("FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
  process.exit(1);
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

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
  res.send("Server is running on api.phuturesync.co.za");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://api.phuturesync.co.za:${PORT}`);
});
