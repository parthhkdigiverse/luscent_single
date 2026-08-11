import socket

# Monkeypatch socket.getaddrinfo to resolve MongoDB Atlas shard hostnames locally,
# bypassing the broken/timing-out DNS resolvers on local network.
original_getaddrinfo = socket.getaddrinfo

MOCK_DNS = {
    "ac-ntkpfxo-shard-00-00.lcbyqbq.mongodb.net": "159.41.224.169",
    "ac-ntkpfxo-shard-00-01.lcbyqbq.mongodb.net": "159.41.229.190",
    "ac-ntkpfxo-shard-00-02.lcbyqbq.mongodb.net": "159.41.233.233"
}

def custom_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if host in MOCK_DNS:
        return original_getaddrinfo(MOCK_DNS[host], port, family, type, proto, flags)
    return original_getaddrinfo(host, port, family, type, proto, flags)

socket.getaddrinfo = custom_getaddrinfo

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
inventory_collection = db["inventory"]
inventory_history_collection = db["inventory_history"]
reviews_collection = db["reviews"]
returns_collection = db["returns"]
