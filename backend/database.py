import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load env files from either backend/ or root folder
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
load_dotenv(env_path)
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "luscentglow")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

def get_database():
    return db

# Collections
users_collection = db["users"]
products_collection = db["products"]
orders_collection = db["orders"]
contacts_collection = db["contacts"]
coupons_collection = db["coupons"]
settings_collection = db["settings"]
content_collection = db["content_blocks"]
