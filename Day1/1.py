
# !Insert Element (Document) in MongoDB using Python



from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://127.0.0.1:27017")
db = client["test"]  # Use your database name
collection = db["sample_collection"]  # Use your collection name

# Document to insert
document = {"name": "John", "age": 30, "city": "New York"}

# Insert the document
result = collection.insert_one(document)
print("Inserted document ID:", result.inserted_id)




# ? output
#* Inserted document ID: 6988c0112749a17bba439539