
#! wap in python to insert the date and time from the api after every 1000ms. Mongosh should hit the api and insert the response in the existing mongodb collections .( https://classmonitor.aucseapp.in/get_date_time.php)



import time, requests
from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017")
col = client["test"]["time_logs"]

def fetch_and_insert():
    try:
        r = requests.get("https://classmonitor.aucseapp.in/get_date_time.php", timeout=5)
        col.insert_one({"api_time": r.json(), "inserted_at": time.strftime('%Y-%m-%d %H:%M:%S')})
        print("Inserted")
    except Exception as e:
        print("Error:", e)

while True:
    fetch_and_insert()
    time.sleep(1)
