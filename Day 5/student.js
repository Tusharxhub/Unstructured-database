//! Write the MongoDB query to insert 1 lakh docs using find & calculate the execution time with indexes & without indexes & perform an analysis within the following techniques:
//! 1) CollScan
//! 2) express IXScan
//! 3) IXScan
//! Also create/add a unique attribute to the index while creating the index & list all the indexes for their collectionc.c



const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://localhost:27018/";
const DB_NAME = "student_db";
const COLLECTION_NAME = "students";
const DOC_COUNT = 100000; // 1 lakh

async function main() {
  const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB\n");

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Drop existing collection
    await collection.drop().catch(() => null);

    console.log(`=== STEP 1: Inserting ${DOC_COUNT} documents ===`);
    const insertStart = Date.now();

    const documents = Array.from({ length: DOC_COUNT }, (_, i) => ({
      studentId: i + 1,
      name: `Student_${i + 1}`,
      email: `student${i + 1}@university.edu`,
      age: Math.floor(Math.random() * 15) + 18,
      gpa: parseFloat((Math.random() * 4).toFixed(2)),
      enrollmentDate: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
    }));

    await collection.insertMany(documents, { ordered: false });
    const insertEnd = Date.now();

    console.log(
      `✓ Inserted ${DOC_COUNT} documents in ${insertEnd - insertStart}ms\n`
    );

    // Test 1: CollScan (full collection scan - no index)
    console.log("=== STEP 2: CollScan (Full Collection Scan) ===");
    console.log(
      "Finding students with age > 25 (no index - forces collection scan)"
    );

    const collScanStart = Date.now();
    const collScanQuery = await collection
      .find({ age: { $gt: 25 } })
      .explain("executionStats");
    const collScanEnd = Date.now();

    console.log(`Stage: ${collScanQuery.executionStats.executionStages.stage}`);
    console.log(
      `Docs Examined: ${collScanQuery.executionStats.executionStages.docsExamined}`
    );
    console.log(
      `Docs Returned: ${collScanQuery.executionStats.nReturned}`
    );
    console.log(`Execution Time: ${collScanEnd - collScanStart}ms\n`);

    // Create regular index on age
    console.log("=== STEP 3: Create Regular Index on 'age' ===");
    const indexCreated = await collection.createIndex({ age: 1 });
    console.log(`✓ Index created: ${indexCreated}`);

    // Create unique index on studentId
    console.log("\n=== STEP 4: Create Unique Index on 'studentId' ===");
    const uniqueIndexCreated = await collection.createIndex(
      { studentId: 1 },
      { unique: true }
    );
    console.log(`✓ Unique index created: ${uniqueIndexCreated}`);

    // List all indexes
    console.log("\n=== STEP 5: List All Indexes ===");
    const indexes = await collection.listIndexes().toArray();
    console.log("Indexes in collection:");
    indexes.forEach((idx, i) => {
      const unique = idx.unique ? " (UNIQUE)" : "";
      console.log(
        `  ${i + 1}. ${JSON.stringify(idx.key)}${unique} - ${idx.name}`
      );
    });

    // Test 2: IXScan (index scan with regular index)
    console.log("\n=== STEP 6: IXScan (Index Scan) ===");
    console.log(
      "Finding students with age > 25 (with index on age - uses IXScan)"
    );

    const ixScanStart = Date.now();
    const ixScanQuery = await collection
      .find({ age: { $gt: 25 } })
      .explain("executionStats");
    const ixScanEnd = Date.now();

    console.log(`Stage: ${ixScanQuery.executionStats.executionStages.stage}`);
    console.log(
      `Docs Examined: ${ixScanQuery.executionStats.executionStages.docsExamined}`
    );
    console.log(
      `Docs Returned: ${ixScanQuery.executionStats.nReturned}`
    );
    console.log(`Execution Time: ${ixScanEnd - ixScanStart}ms\n`);

    // Test 3: Unique Index Scan
    console.log("=== STEP 7: Unique Index Scan ===");
    console.log(
      "Finding student by studentId=50000 (with unique index - most efficient)"
    );

    const uniqueIxScanStart = Date.now();
    const uniqueIxScanQuery = await collection
      .find({ studentId: 50000 })
      .explain("executionStats");
    const uniqueIxScanEnd = Date.now();

    console.log(`Stage: ${uniqueIxScanQuery.executionStats.executionStages.stage}`);
    console.log(
      `Docs Examined: ${uniqueIxScanQuery.executionStats.executionStages.docsExamined}`
    );
    console.log(
      `Docs Returned: ${uniqueIxScanQuery.executionStats.nReturned}`
    );
    console.log(`Execution Time: ${uniqueIxScanEnd - uniqueIxScanStart}ms\n`);

    // Performance Analysis Summary
    console.log("=== PERFORMANCE ANALYSIS SUMMARY ===");
    console.log(
      `CollScan Time:        ${collScanEnd - collScanStart}ms (examines all ${DOC_COUNT} docs)`
    );
    console.log(
      `IXScan Time:          ${ixScanEnd - ixScanStart}ms (uses index on age)`
    );
    console.log(
      `Unique IXScan Time:   ${uniqueIxScanEnd - uniqueIxScanStart}ms (uses unique index)`
    );

    const collToIx =
      (((collScanEnd - collScanStart) - (ixScanEnd - ixScanStart)) /
        (collScanEnd - collScanStart)) *
      100;
    const collToUnique =
      (((collScanEnd - collScanStart) - (uniqueIxScanEnd - uniqueIxScanStart)) /
        (collScanEnd - collScanStart)) *
      100;

    console.log(
      `\n📊 Speed Improvement:`
    );
    console.log(
      `  IXScan is ~${collToIx.toFixed(2)}% faster than CollScan`
    );
    console.log(
      `  Unique IXScan is ~${collToUnique.toFixed(2)}% faster than CollScan`
    );

    console.log(
      "\n✓ Analysis complete! Indexes significantly improve query performance."
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
    console.log("\n✓ MongoDB connection closed");
  }
}

main().catch(console.error);



