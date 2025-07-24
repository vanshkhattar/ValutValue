import { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";

interface SpikeData {
  timestamp: string;
  product_name: string;
  quantity: number;
  surge_percent: number;
}

interface Props {
  spikeFile: string;
  selectedProduct: string;
  setSelectedProduct: (p: string) => void;
}

export default function SpikeChart({
  spikeFile,
  selectedProduct,
  setSelectedProduct,
}: Props) {
  const [data, setData] = useState<SpikeData[]>([]);
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSV = async () => {
      const res = await axios.get(
        `http://localhost:8000/ml-outputs/${spikeFile}`,
        { responseType: "blob" }
      );
      const text = await res.data.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (r) => {
          const parsed: SpikeData[] = (r.data as any[]).map((d) => ({
            timestamp: d.timestamp,
            product_name: d.product_name,
            quantity: Number(d.quantity),
            surge_percent: Number(d.surge_percent),
          }));
          setData(
            parsed.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )
          );
          const products = [...new Set(parsed.map((d) => d.product_name))];
          setProductOptions(products);
          if (!products.includes(selectedProduct))
            setSelectedProduct(products[0] || "");
          setLoading(false);
        },
      });
    };
    fetchCSV();
  }, [spikeFile]);

  const filtered = selectedProduct
    ? data.filter((d) => d.product_name === selectedProduct)
    : data;

  return (
    <div className="w-full h-[420px] bg-white shadow rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">📈 Spike Chart</h2>

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="p-2 border rounded"
        >
          {productOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading chart...</p>
      ) : filtered.length === 0 ? (
        <p>No spikes for this product.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) =>
                new Date(v).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              }
              minTickGap={20}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#8884d8"
              name="Quantity"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="surge_percent"
              stroke="#ff7300"
              name="Surge %"
              strokeWidth={2}
            />
            <Brush dataKey="timestamp" height={25} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
