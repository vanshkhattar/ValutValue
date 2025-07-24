export interface ForecastResult {
  spike_file: string;
  summary_file: string;
  suggestion_file: string;
  forecast_file: string | null; // ✅ Add this
  spike_count: number;
  products_analyzed: number;
}


export async function fetchForecast(
  salesPath: string,
  inventoryPath: string
): Promise<ForecastResult> {
  const res = await fetch("/api/v1/ml/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sales_csv_path: salesPath,
      inventory_csv_path: inventoryPath,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to run forecast model");
  }

  return await res.json();
}
