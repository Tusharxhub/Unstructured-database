
#! wap in python to insert the date and time from the api after every 1000ms. Mongosh should hit the api and insert the response in the existing mongodb collections .( https://classmonitor.aucseapp.in/get_date_time.php)
import time
import requests
from pymongo import MongoClient

DB_NAME = "test"
COLLECTION_NAME = "time_logs"
MONGO_URI = "mongodb://127.0.0.1:27017"
API_URL = "https://classmonitor.aucseapp.in/get_date_time.php"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

def fetch_and_insert_time():
    try:
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status()
        api_data = response.json()
        document = {
            "api_time": api_data,
            "inserted_at": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        collection.insert_one(document)
        print("Inserted:", document)
    except Exception as e:
        print("Error:", e)

def main():
    print("Connected to MongoDB")
    while True:
        fetch_and_insert_time()
        time.sleep(1)

if __name__ == "__main__":
    main()