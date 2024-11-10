from motor.motor_asyncio import AsyncIOMotorClient

from src.config import settings


class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database() -> AsyncIOMotorClient:
    return db.client[settings.database_name]

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    
async def close_mongo_connection():
    db.client.close()
