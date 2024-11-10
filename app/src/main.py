from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import close_mongo_connection, connect_to_mongo
from src.routes import assets, customers, infrastructure, sites

app = FastAPI(title="Asset Management System")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, tags=["assets"])
app.include_router(customers.router, prefix="/customers", tags=["customers"])
app.include_router(sites.router, prefix="/sites", tags=["sites"])
app.include_router(
    infrastructure.router,
    prefix="/infrastructure",
    tags=["infrastructure"]
)

