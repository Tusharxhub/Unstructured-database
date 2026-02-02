//!  Write a python script to insert the written time from the API after every 1000 ms. Moghesh should hit the API and insert the response in the existing MongoDB collection 


const https = require("https");
const { MongoClient } = require("mongodb");

const dbName = "test";
const collectionName = "time_logs";
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

const client = new MongoClient(mongoUri);

async function fetchAndInsertTime() {
  https.get("https://classmonitor.aucseapp.in/get_date_time.php", (res) => {
    let rawData = "";

    res.on("data", chunk => {
      rawData += chunk;
    });

    res.on("end", () => {
      (async () => {
        try {
          const apiData = JSON.parse(rawData);

          const document = {
            api_time: apiData,
            inserted_at: new Date()
          };

          const db = client.db(dbName);
          await db.collection(collectionName).insertOne(document);

          console.log("Inserted:", document);
        } catch (err) {
          console.error("JSON Parse Error:", err.message);
        }
      })();
    });
  }).on("error", (err) => {
    console.error("HTTP Error:", err.message);
  });
}

async function main() {
  await client.connect();
  console.log("Connected to MongoDB");
  setInterval(fetchAndInsertTime, 1000);
}

main().catch((err) => {
  console.error("Startup Error:", err.message);
  process.exit(1);
});