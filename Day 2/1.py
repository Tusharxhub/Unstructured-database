
#! Update an existing document in MongoDB using data from the API


import requests
from pymongo import MongoClient

DB_NAME = "test"
COLLECTION_NAME = "time_logs"
MONGO_URI = "mongodb://127.0.0.1:27017"
API_URL = "https://classmonitor.aucseapp.in/get_date_time.php"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Fetch new data from the API
response = requests.get(API_URL, timeout=5)
response.raise_for_status()
api_data = response.json()

# Define the filter for the document to update (customize as needed)
update_filter = {"api_time": {"$exists": True}}

# Define the update operation
update_operation = {"$set": {"api_time": api_data}}

# Update one document
result = collection.update_one(update_filter, update_operation)
print("Matched count:", result.matched_count)
print("Modified count:", result.modified_count)


# ? output
#* Matched count: 1
#* Modified count: 1