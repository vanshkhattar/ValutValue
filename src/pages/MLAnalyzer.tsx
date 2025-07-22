import React, { useState } from "react";
import { useUploadAndAnalyzeCSVMutation } from "../provider/queries/Analysis.query";
import { toast } from "sonner";
import SpikeChart from "../components/SpikeChart";
import InventoryAlerts from "../components/InventoryAlerts";
import { UploadIcon } from "lucide-react";

const MLAnalyzer = () => {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [inventoryFile, setInventoryFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showChart, setShowChart] = useState(false);

  // lifted state for product filter
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const [uploadAndAnalyzeCSV, { isLoading }] = useUploadAndAnalyzeCSVMutation();

  const handleSubmit = async () => {
    if (!salesFile || !inventoryFile) {
      toast.error("❌ Select both CSV files.");
      return;
    }

    const formData = new FormData();
    formData.append("sales", salesFile);
    formData.append("inventory", inventoryFile);

    try {
      const data = await uploadAndAnalyzeCSV(formData).unwrap();
      setResult(data);
      setShowChart(true);
      toast.success("✅ Analysis completed!");
    } catch (err) {
      toast.error("❌ Upload failed.");
      console.error(err);
    }
  };

  const dl = (label: string, path: string, emoji: string) => (
    <div className="bg-white shadow-md rounded p-4 w-full sm:w-[48%] md:w-[23%]">
      <h3 className="font-medium mb-2">
        {emoji} {label}
      </h3>
      <a
        href={`http://localhost:8000${path}`}
        download
        className="text-blue-600 hover:underline text-sm"
      >
        Download {label}
      </a>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">📊 ML Spike Detection Panel</h2>
        <p className="text-gray-600 text-sm">
          Upload sales & inventory CSVs to detect spikes and get suggestions.
        </p>
      </div>

      {/* upload inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">🛒 Sales CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSalesFile(e.target.files?.[0] || null)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">📦 Inventory CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setInventoryFile(e.target.files?.[0] || null)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="transition-all bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex items-center gap-2"
      >
        <UploadIcon className="w-5 h-5" />
        {isLoading ? "Analyzing..." : "Run Analysis"}
      </button>

      {/* result cards + alerts */}
      {result && (
        <>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-medium text-green-700 mb-2">
              ✅ {result.msg || "Analysis Completed"}
            </p>
            <div className="flex flex-wrap gap-4">
              {dl("Detected Spikes", result.spike_file, "📈")}
              {dl("Demand Summary", result.summary_file, "📊")}
              {dl("Inventory Suggestions", result.suggestion_file, "📦")}
              {dl("Forecasted Sales", result.forecast_file, "🔮")}
            </div>
          </div>

          {/* alerts filtered by selectedProduct */}
          <InventoryAlerts selectedProduct={selectedProduct} />
        </>
      )}

      {/* spike chart */}
      {showChart && result?.spike_file && (
        <SpikeChart
          spikeFile={result.spike_file.split("/").pop()!}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
        />
      )}
    </div>
  );
};

export default MLAnalyzer;
