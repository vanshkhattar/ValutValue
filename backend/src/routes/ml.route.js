const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");  // ✅ Use this instead of papaparse

const { runForecastController } = require("../controllers/ml.controller");

const upload = multer({
  dest: path.join(__dirname, "../../../ml_backend/uploads"),
});

// Health check
router.get("/ping", (req, res) => {
  res.send("✅ ML Route is working");
});

// Upload and analyze
router.post(
  "/analyze",
  upload.fields([
    { name: "sales", maxCount: 1 },
    { name: "inventory", maxCount: 1 },
  ]),
  runForecastController
);

// ✅ Serve parsed spike CSV
router.get("/spikes", (req, res) => {
  const filePath = path.join(__dirname, "../../../ml_backend/outputs/detected_spikes.csv");

  if (!fs.existsSync(filePath)) {
    console.log("Spike CSV not found at", filePath);
    return res.status(404).json({ message: "Spike file not found" });
  }

  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", () => {
      res.json({ spikes: results });
    })
    .on("error", (err) => {
      console.error("CSV parsing failed:", err);
      res.status(500).json({ message: "Failed to parse CSV", error: err.message });
    });
});

module.exports = router;

