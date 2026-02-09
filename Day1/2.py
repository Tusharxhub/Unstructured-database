
#!Delete 1 Element (Document) in MongoDB using Python


from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017")
db = client["test"]  # Use your database name
collection = db["sample_collection"]  # Use your collection name

# List all documents in the collection
print("Documents in collection before deletion:")
for doc in collection.find():
	print(doc)

# Define the filter for the document to delete
delete_filter = {"name": "Tushar"}  # Change as needed

# Delete one document matching the filter
result = collection.delete_one(delete_filter)
print("Deleted count:", result.deleted_count)

#* output
#* Documents in collection before deletion:
#* {'_id': ObjectId('69899318599401bafb4fc05e'), 'name': 'Tushar', 'age': 21, 'city': 'Kolkata'}
#* Deleted count: 1	