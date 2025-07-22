const fs = require("fs");
const csv = require("csv-parser");

function readCsvToJson(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        results.push({
          timestamp: row.timestamp?.trim(),
          product_id: row.product_id?.trim(),
          product_name: row.product_name?.trim(),
          location: row.location?.trim(),
          quantity: parseInt(row.quantity),
          z_score: parseFloat(row.z_score),
          surge_percent: parseFloat(row.surge_percent),
        });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

module.exports = readCsvToJson;
