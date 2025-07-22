import React, { useState } from "react";
import { fetchForecast } from "../service/mlService.ts";

type ForecastResult = {
  spike_file: string;
  summary_file: string;
  suggestion_file: string;
  forecast_file: string | null;
  spike_count: number;
  products_analyzed: number;
};

export default function InventoryInsights() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ForecastResult | null>(null);
  const [error, setError] = useState("");

  const handleRunModel = async () => {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetchForecast("supermarket_sales_data.csv", "inventory_status.csv");
      setResults(response);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to run model. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">📊 Inventory Spike Forecasting</h1>

      <button
        onClick={handleRunModel}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? "Analyzing..." : "Run Spike Forecast Model"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {results && (
        <div className="mt-6 space-y-4">
          <p>✅ Spike Detection File: <code>{results.spike_file}</code></p>
          <p>📈 Demand Summary File: <code>{results.summary_file}</code></p>
          <p>📦 Inventory Suggestions File: <code>{results.suggestion_file}</code></p>
          {results.forecast_file && (
            <p>📉 Forecasted Sales File: <code>{results.forecast_file}</code></p>
          )}
          <p>🔍 Spikes Found: <strong>{results.spike_count}</strong></p>
          <p>🧪 Products Analyzed: <strong>{results.products_analyzed}</strong></p>

          {/* Download buttons */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <a
              href={results.spike_file}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
              download
            >
              Download Spikes CSV
            </a>
            <a
              href={results.summary_file}
              className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
              download
            >
              Download Demand Summary
            </a>
            <a
              href={results.suggestion_file}
              className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700"
              download
            >
              Download Suggestions
            </a>
            {results.forecast_file && (
              <a
                href={results.forecast_file}
                className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
                download
              >
                Download Forecasted Sales
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
