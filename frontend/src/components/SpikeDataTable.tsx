import { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingUp, Sparkles, X, CheckCircle } from "lucide-react";

interface AlertItem {
  type: "danger" | "warning" | "info";
  product: string;
  message: string;
  id: string;
  location: string;
}

interface Props {
  suggestionFile: string;
  spikeFile: string;
  forecastFile: string;
  selectedProduct: string;
}

export default function InventoryAlerts({
  suggestionFile,
  spikeFile,
  forecastFile,
  selectedProduct,
}: Props) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "danger" | "warning" | "info">("all");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  useEffect(() => {
    if (!suggestionFile || !spikeFile || !forecastFile) return;

    const fetchCSV = async (fullPath: string) => {
      const res = await axios.get(`http://localhost:8000${fullPath}`, {
        responseType: "blob",
      });
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

    const loadAlerts = async () => {
      try {
        setLoading(true);
        const [forecastData, spikeData, suggestionData] = await Promise.all([
          fetchCSV(forecastFile),
          fetchCSV(spikeFile),
          fetchCSV(suggestionFile),
        ]);

        const newAlerts: AlertItem[] = [];
        const seen = new Set<string>();

        suggestionData.forEach((row: any, i: number) => {
          if (row.order_recommendation === "ORDER") {
            const msg = `${row.product_name} low at ${row.location}. Reorder now!`;
            if (!seen.has(msg)) {
              newAlerts.push({ 
                type: "danger", 
                product: row.product_name, 
                message: msg, 
                id: `suggestion-${i}`,
                location: row.location
              });
              seen.add(msg);
            }
          }
        });

        spikeData.forEach((row: any, i: number) => {
          const surge = Number(row.surge_percent);
          const msg = `${row.product_name} spiked ${surge}% at ${row.location}`;
          if (surge > 100 && !seen.has(msg)) {
            newAlerts.push({ 
              type: "warning", 
              product: row.product_name, 
              message: msg, 
              id: `spike-${i}`,
              location: row.location
            });
            seen.add(msg);
          }
        });

        forecastData.slice(0, 3).forEach((row: any, i: number) => {
          const msg = `Forecast: ${row.product_name} demand ≈ ${row.forecasted_quantity}`;
          if (!seen.has(msg)) {
            newAlerts.push({ 
              type: "info", 
              product: row.product_name, 
              message: msg, 
              id: `forecast-${i}`,
              location: row.location
            });
            seen.add(msg);
          }
        });

        // Sort by priority: danger > warning > info
        newAlerts.sort((a, b) => {
          const priority = { danger: 1, warning: 2, info: 3 };
          return priority[a.type] - priority[b.type];
        });

        setAlerts(newAlerts);
      } catch (err) {
        console.error("Alert fetch error", err);
        setToast({ message: "Failed to load alerts", show: true });
        setTimeout(() => setToast({ message: "", show: false }), 3000);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [suggestionFile, spikeFile, forecastFile]);

  const handleAction = (alert: AlertItem) => {
    let message = "";
    switch (alert.type) {
      case "danger":
        message = `Order placed for ${alert.product} at ${alert.location}`;
        break;
      case "warning":
        message = `Viewing spike details for ${alert.product}`;
        break;
      case "info":
        message = `Viewing forecast for ${alert.product}`;
        break;
    }
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: "", show: false }), 3000);
    dismissAlert(alert.id);
  };

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  const filteredAlerts = alerts
    .filter((alert) => !dismissedAlerts.has(alert.id))
    .filter((alert) => (selectedProduct ? alert.product === selectedProduct : true))
    .filter((alert) => (filterType === "all" ? true : alert.type === filterType));

  const getIcon = (type: AlertItem["type"]) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <TrendingUp className="w-5 h-5" />;
      case "info":
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getActionText = (type: AlertItem["type"]) => {
    switch (type) {
      case "danger":
        return "Place Order";
      case "warning":
        return "View Details";
      case "info":
        return "See Forecast";
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          Inventory Alerts
        </h2>
        <div className="flex flex-wrap gap-2">
          {["all", "danger", "warning", "info"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                filterType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No alerts available for this selection.</p>
      ) : (
        <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredAlerts.map((alert) => (
              <motion.li
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm border-l-4 ${
                  alert.type === "danger"
                    ? "bg-red-50 border-red-500 text-red-800"
                    : alert.type === "warning"
                    ? "bg-yellow-50 border-yellow-500 text-yellow-800"
                    : "bg-blue-50 border-blue-500 text-blue-800"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getIcon(alert.type)}
                  <span>{alert.message}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(alert)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      alert.type === "danger"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : alert.type === "warning"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {getActionText(alert.type)}
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-black/10 rounded-full"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}