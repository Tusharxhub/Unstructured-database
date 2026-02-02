//!  Write a python script to insert the written time from the API after every 1000 ms. Moghesh should hit the API and insert the response in the existing MongoDB collection 






const https = require("https");

const dbName = "test";
const collectionName = "time_logs";

use(dbName);

function fetchAndInsertTime() {
  https.get("https://classmonitor.aucseapp.in/get_date_time.php", (res) => {
    let rawData = "";

    res.on("data", chunk => {
      rawData += chunk;
    });

    res.on("end", () => {
      try {
        const apiData = JSON.parse(rawData);

        const document = {
          api_time: apiData,
          inserted_at: new Date()
        };

        db.getCollection(collectionName).insertOne(document);

        print("Inserted:", document);
      } catch (err) {
        print("JSON Parse Error:", err.message);
      }
    });
  }).on("error", (err) => {
    print("HTTP Error:", err.message);
  });
}

// Run every 1000 ms (1 second)
setInterval(fetchAndInsertTime, 1000);