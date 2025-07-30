import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from scipy.stats import norm
import os
import json


def prepare_data(sales_csv, inventory_csv, default_service_level=0.95):
    df_sales = pd.read_csv(sales_csv, low_memory=False)
    df_inv = pd.read_csv(inventory_csv, low_memory=False)

    date_cols = [c for c in df_sales.columns if 'date' in c.lower() or 'time' in c.lower()]
    if not date_cols:
        raise ValueError("No date/time column found")
    date_col = date_cols[0]
    df_sales[date_col] = pd.to_datetime(df_sales[date_col])

    qty_cols = [c for c in df_sales.columns if c.lower() in ('quantity', 'qty', 'sales')]
    if not qty_cols:
        raise ValueError("No quantity column found")
    qty_col = qty_cols[0]

    for col in ('product_id', 'product_name', 'location'):
        if col not in df_sales.columns:
            raise ValueError(f"Missing '{col}' column in sales")

    df_hourly = (
        df_sales
        .set_index(date_col)
        .groupby(['product_id', 'product_name', 'location'])
        .resample('h')[qty_col]
        .sum()
        .reset_index()
        .rename(columns={date_col: 'timestamp', qty_col: 'quantity'})
    )

    df_daily = (
        df_sales
        .set_index(date_col)
        .groupby(['product_id', 'product_name', 'location'])
        .resample('D')[qty_col]
        .sum()
        .reset_index()
        .rename(columns={date_col: 'timestamp', qty_col: 'quantity'})
    )

    required_inv = ['product_id', 'location', 'current_stock', 'lead_time_days',
                    'order_cost', 'holding_cost_per_unit_per_year']
    for col in required_inv:
        if col not in df_inv.columns:
            raise ValueError(f"Missing '{col}' in inventory")

    if 'service_level' not in df_inv.columns:
        df_inv['service_level'] = default_service_level
    else:
        df_inv['service_level'] = df_inv['service_level'].fillna(default_service_level)

    return df_hourly, df_daily, df_inv


def detect_spikes(series, period=24, z_thresh=1.8):
    series = series.asfreq("h").fillna(0)
    res = STL(series, period=period, robust=True).fit()
    z_scores = (res.resid - res.resid.mean()) / res.resid.std()
    spikes = z_scores[z_scores > z_thresh]
    return spikes, z_scores


def analyze_trend_seasonality(series, period=24):
    series = series.asfreq("h").fillna(0)
    res = STL(series, period=period, robust=True).fit()
    return res.trend, res.seasonal


def forecast_demand(series, forecast_hours=24):
    series = series.asfreq("h").fillna(0)
    if len(series) < 2 * 24:
        model = ExponentialSmoothing(series, trend='add', seasonal=None).fit()
    else:
        model = ExponentialSmoothing(series, trend='add', seasonal='add', seasonal_periods=24).fit()
    return model.forecast(forecast_hours)


def compute_inventory_params(avg_daily, std_daily, lead_time, service_level, holding_cost, order_cost):
    z = norm.ppf(service_level)
    ss = z * std_daily * np.sqrt(lead_time)
    rp = avg_daily * lead_time + ss
    D = avg_daily * 365
    eoq = np.sqrt((2 * D * order_cost) / holding_cost)
    return ss, rp, eoq


def suggest_inventory_levels(forecast_series, safety_factor=1.2):
    suggestions = []
    for ts, demand in forecast_series.items():
        suggested_stock = int(np.ceil(demand * safety_factor)) if pd.notna(demand) else 0
        suggestions.append({
            "timestamp": ts,
            "predicted_demand": round(demand, 2) if pd.notna(demand) else 0,
            "suggested_stock": suggested_stock
        })
    return pd.DataFrame(suggestions)


def run_forecast_pipeline(sales_csv, inventory_csv, output_dir):
    hourly_df, daily_df, inv_df = prepare_data(sales_csv, inventory_csv)

    spikes, summary, suggestions, forecast_dfs = [], [], [], []

    for (pid, pname, loc), group in hourly_df.groupby(['product_id', 'product_name', 'location']):
        ts_hourly = group.set_index('timestamp')['quantity']
        try:
            spk, z_scores = detect_spikes(ts_hourly)
            trend, seas = analyze_trend_seasonality(ts_hourly)
            forecast = forecast_demand(ts_hourly)

            # Save forecasted sales
            forecast_df = forecast.reset_index()
            forecast_df.columns = ['timestamp', 'forecasted_quantity']
            forecast_df['product_id'] = pid
            forecast_df['product_name'] = pname
            forecast_df['location'] = loc
            forecast_dfs.append(forecast_df)

            sugg_df = suggest_inventory_levels(forecast)
            sugg_df.insert(0, 'product_id', pid)
            sugg_df.insert(1, 'product_name', pname)
            sugg_df.insert(2, 'location', loc)

            # Spike records (only positive surge)
            for ts, z in spk.items():
                q = ts_hourly.get(ts, 0)
                q_int = int(q) if pd.notna(q) else 0
                mean_qty = ts_hourly.mean()
                surge_pct = round((q / mean_qty - 1) * 100, 1) if mean_qty else 0

                if surge_pct < 0:
                    continue  # skip demand dips

                spikes.append({
                    "timestamp": ts,
                    "product_id": pid,
                    "product_name": pname,
                    "location": loc,
                    "z_score": round(z, 2),
                    "quantity": q_int,
                    "surge_percent": surge_pct
                })

            # Inventory recommendation
            try:
                inv_row = inv_df.set_index(['product_id', 'location']).loc[(pid, loc)]
                ts_daily = daily_df[
                    (daily_df['product_id'] == pid) & (daily_df['location'] == loc)
                ].set_index('timestamp')['quantity']

                avg_d, std_d = ts_daily.mean(), ts_daily.std()

                ss, rp, eoq = compute_inventory_params(
                    avg_d, std_d,
                    inv_row.lead_time_days,
                    inv_row.service_level,
                    inv_row.holding_cost_per_unit_per_year,
                    inv_row.order_cost
                )

                sugg_df["order_recommendation"] = "ORDER" if inv_row.current_stock < rp else "HOLD"
                sugg_df["reorder_point"] = int(np.ceil(rp)) if pd.notna(rp) else 0
                sugg_df["EOQ"] = int(np.ceil(eoq)) if pd.notna(eoq) else 0

            except KeyError:
                sugg_df["order_recommendation"] = "UNKNOWN"
                sugg_df["reorder_point"] = 0
                sugg_df["EOQ"] = 0

            suggestions.append(sugg_df)

            summary.append({
                "product_id": pid,
                "product_name": pname,
                "location": loc,
                "avg_hourly": round(ts_hourly.mean(), 2),
                "max_hourly": int(ts_hourly.max()),
                "min_hourly": int(ts_hourly.min()),
                "var_hourly": round(ts_hourly.var(), 2),
                "spike_count": len(spk)
            })

        except Exception as e:
            print(f"Warning: Skipping {pname}@{loc} - {e}")

    os.makedirs(output_dir, exist_ok=True)

    spike_path = os.path.join(output_dir, "detected_spikes.csv")
    summary_path = os.path.join(output_dir, "demand_summary.csv")
    suggestion_path = os.path.join(output_dir, "inventory_suggestions.csv")
    forecast_path = os.path.join(output_dir, "forecasted_sales.csv")

    pd.DataFrame(spikes).to_csv(spike_path, index=False)
    pd.DataFrame(summary).to_csv(summary_path, index=False)
    pd.concat(suggestions, ignore_index=True).to_csv(suggestion_path, index=False) if suggestions else pd.DataFrame().to_csv(suggestion_path, index=False)
    pd.concat(forecast_dfs, ignore_index=True).to_csv(forecast_path, index=False) if forecast_dfs else pd.DataFrame().to_csv(forecast_path, index=False)

    return {
        "spike_file": spike_path,
        "summary_file": summary_path,
        "suggestion_file": suggestion_path,
        "forecast_file": forecast_path,
        "spike_count": len(spikes),
        "products_analyzed": len(summary)
    }


if __name__ == "__main__":
    import sys

    sales_path = sys.argv[1]
    inventory_path = sys.argv[2]
    output_dir = "ml_backend/outputs"

    result = run_forecast_pipeline(sales_path, inventory_path, output_dir)

    print(json.dumps({
        "msg": "✅ Forecast completed successfully",
        "spike_file": f"/ml-outputs/{os.path.basename(result['spike_file'])}",
        "summary_file": f"/ml-outputs/{os.path.basename(result['summary_file'])}",
        "suggestion_file": f"/ml-outputs/{os.path.basename(result['suggestion_file'])}",
        "forecast_file": f"/ml-outputs/{os.path.basename(result['forecast_file'])}",
        "spike_count": result["spike_count"],
        "products_analyzed": result["products_analyzed"]
    }))
