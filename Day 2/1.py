
#! Update an existing document in MongoDB using data from the API


import requests
from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017")
db = client["test"]
col = db["time_logs"]

data = requests.get("https://classmonitor.aucseapp.in/get_date_time.php", timeout=5).json()
res = col.update_one({"api_time": {"$exists": True}}, {"$set": {"api_time": data}})
print("Matched count:", res.matched_count)
print("Modified count:", res.modified_count)


# ? output
#* Matched count: 1
#* Modified count: 1