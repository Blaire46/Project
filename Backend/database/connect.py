from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Connecting to: {uri}")

client = MongoClient(uri)

# Test connection
print("Databases:", client.list_database_names())

# Create/new database reference
db = client["cancer_center"]
print(f"Database 'cancer_center' is ready (will appear when data is added)")