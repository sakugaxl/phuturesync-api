require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeFirebaseApp } = require("./utils/firebase");
const PORT = process.env.PORT || 4040;

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://www.phuturesync.co.za" }));

initializeFirebaseApp();

// Import Routes
const authRoutes = require("./routes/auth");
const insightsRoutes = require("./routes/insights");

app.use("/auth", authRoutes);
app.use("/api/insights", insightsRoutes);

app.get("/", (req, res) => {
  res.send("Server is running on api.phuturesync.co.za");
});

app.listen(PORT, (err) => {
  if (err) console.error(err);
  console.log("Server is running on PORT", PORT);
});
