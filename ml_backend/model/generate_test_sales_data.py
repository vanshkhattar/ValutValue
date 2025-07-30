# generate_test_sales_data.py
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Create hourly timestamps for 3 days
start_time = datetime.now() - timedelta(days=3)
timestamps = pd.date_range(start=start_time, periods=72, freq='h')

data = []

product_id = 101
product_name = "EnergyDrink"
location = "Hyderabad"

for ts in timestamps:
    # Normal quantity with small variance
    quantity = int(np.random.normal(20, 5))
    
    # Introduce intentional spikes
    if random.random() < 0.1:
        quantity += random.randint(50, 100)  # big spike
    
    data.append({
        "timestamp": ts,
        "product_id": product_id,
        "product_name": product_name,
        "location": location,
        "quantity": max(1, quantity)
    })

df = pd.DataFrame(data)
df.to_csv("test_sales_data.csv", index=False)
print("✅ CSV with artificial spikes generated: test_sales_data.csv")

