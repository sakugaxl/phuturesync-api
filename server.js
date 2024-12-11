require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db } = require("./utils/firebase");

const app = express();
app.use(cors({ origin: "https://www.phuturesync.co.za" }));
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/auth");
const insightsRoutes = require("./routes/insights");

app.use("/auth", authRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/", (req, res) => {
  res.send("Server is running on api.phuturesync.co.za");
});

// Debug the key before the server starts
console.log("FIREBASE_SERVICE_ACCOUNT_KEY loaded successfully.");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://api.phuturesync.co.za:${PORT}`);
});
