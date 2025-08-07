from fastapi import FastAPI
from routes.forecast import router as forecast_router

app = FastAPI()
app.include_router(forecast_router)
