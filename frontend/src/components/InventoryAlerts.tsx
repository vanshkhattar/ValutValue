import { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";

interface AlertItem {
  type: "danger" | "warning" | "info";
  product: string;
  message: string;
}

export default function InventoryAlerts({
  selectedProduct,
}: {
  selectedProduct: string;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const fetchCSV = async (file: string) => {
          const res = await axios.get(
            `http://localhost:8000/ml-outputs/${file}`,
            { responseType: "blob" }
          );
          const text = await res.data.text();
          return new Promise<any[]>((resolve, reject) => {
            Papa.parse(text, {
              header: true,
              skipEmptyLines: true,
              complete: (r) => resolve(r.data as any[]),
              error: reject,
            });
          });
        };

        const [forecastData, spikeData, suggestionData] = await Promise.all([
          fetchCSV("forecasted_sales.csv"),
          fetchCSV("detected_spikes.csv"),
          fetchCSV("inventory_suggestions.csv"),
        ]);

        const newAlerts: AlertItem[] = [];
        const seenMessages = new Set<string>(); // Track already added messages

        // Deduplicated Inventory Suggestions
        suggestionData.forEach((row: any) => {
          if (row.order_recommendation === "ORDER") {
            const msg = `⚠️ ${row.product_name} low at ${row.location}. Reorder now!`;
            if (!seenMessages.has(msg)) {
              newAlerts.push({
                type: "danger",
                product: row.product_name,
                message: msg,
              });
              seenMessages.add(msg);
            }
          }
        });

        // Deduplicated Spike Alerts
        spikeData.forEach((row: any) => {
          const surge = Number(row.surge_percent);
          const msg = `📈 ${row.product_name} spiked ${surge}% at ${row.location}`;
          if (surge > 100 && !seenMessages.has(msg)) {
            newAlerts.push({
              type: "warning",
              product: row.product_name,
              message: msg,
            });
            seenMessages.add(msg);
          }
        });

        // Deduplicated Forecasts
        forecastData.slice(0, 3).forEach((row: any) => {
          const msg = `🔮 Forecast: ${row.product_name} demand ≈ ${row.forecasted_quantity}`;
          if (!seenMessages.has(msg)) {
            newAlerts.push({
              type: "info",
              product: row.product_name,
              message: msg,
            });
            seenMessages.add(msg);
          }
        });

        setAlerts(newAlerts);
      } catch (err) {
        console.error("Alert fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  // 👉 filter by selectedProduct
  const visibleAlerts =
    selectedProduct === ""
      ? alerts
      : alerts.filter((a) => a.product === selectedProduct);

  return (
    <div className="w-full bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-3">🚨 Inventory Alerts</h2>

      {loading ? (
        <p>Loading alerts...</p>
      ) : visibleAlerts.length === 0 ? (
        <p className="text-gray-500">No alerts for this product.</p>
      ) : (
        <ul className="space-y-2">
          {visibleAlerts.map((alert, i) => (
            <li
              key={i}
              className={`px-4 py-2 rounded text-sm border-l-4 ${
                alert.type === "danger"
                  ? "bg-red-100 border-red-500 text-red-800"
                  : alert.type === "warning"
                  ? "bg-yellow-100 border-yellow-500 text-yellow-800"
                  : "bg-blue-100 border-blue-500 text-blue-800"
              }`}
            >
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
