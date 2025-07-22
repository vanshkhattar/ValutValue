const { spawn } = require("child_process");
const path = require("path");

exports.runForecastController = (req, res) => {
  const salesFile = req.files?.sales?.[0];
  const inventoryFile = req.files?.inventory?.[0];

  if (!salesFile || !inventoryFile) {
    return res.status(400).json({ error: "Missing uploaded files." });
  }

  const sales_csv_path = salesFile.path;
  const inventory_csv_path = inventoryFile.path;

  const pythonPath = "python"; // or "python3" if needed
  const scriptPath = path.join(__dirname, "../../../ml_backend/model/spike_forecast.py");

  const pyProcess = spawn(pythonPath, [scriptPath, sales_csv_path, inventory_csv_path]);

  let output = "";
  let errorOutput = "";

  pyProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pyProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pyProcess.on("close", (code) => {
    if (code !== 0 || errorOutput) {
      console.error("❌ Python Error:\n", errorOutput);
      return res.status(500).json({ error: "Python script failed", details: errorOutput });
    }

    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (parseErr) {
      console.error("❌ Output parse error:\n", output);
      return res.status(500).json({ error: "Output parse error", raw: output });
    }
  });
};
