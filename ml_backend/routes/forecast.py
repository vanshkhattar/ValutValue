from fastapi import APIRouter, UploadFile, File
import os
import pandas as pd
from tempfile import NamedTemporaryFile
from model.spike_forecast import run_forecast_pipeline
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

app = FastAPI()

# Mount the output folder at this path:


router = APIRouter()

app.mount("/api/v1/ml/spikes", StaticFiles(directory="ml_outputs"), name="spikes")
@router.post("/api/forecast")
async def upload_files(sales: UploadFile = File(...), inventory: UploadFile = File(...)):
    with NamedTemporaryFile(delete=False, suffix=".csv") as sales_tmp:
        sales_tmp.write(await sales.read())
        sales_path = sales_tmp.name

    with NamedTemporaryFile(delete=False, suffix=".csv") as inv_tmp:
        inv_tmp.write(await inventory.read())
        inv_path = inv_tmp.name

    output_dir = os.path.join(os.getcwd(), "ml_outputs")
    result = run_forecast_pipeline(sales_path, inv_path, output_dir)
    return result
