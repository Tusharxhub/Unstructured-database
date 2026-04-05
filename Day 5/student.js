//! Write the MongoDB query to insert 1 lakh docs using find & calculate the execution time with indexes & without indexes & perform an analysis within the following techniques:
//! 1) CollScan
//! 2) express IXScan
//! 3) IXScan
//! Also create/add a unique attribute to the index while creating the index & list all the indexes for their collectionc.c



const { MongoClient } = require("mongodb");

const URI = "mongodb://localhost:27018/";
const DB = "student_db";
const COL = "students";
const N = 100000;

const ms = () => Date.now();
const elapsed = (t) => `${Date.now() - t}ms`;
const stage = (exp) =>
  exp.executionStats.executionStages.inputStage?.stage ||
  exp.executionStats.executionStages.stage;

async function run() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });

  try {
    await client.connect();
    const col = client.db(DB).collection(COL);
    await col.drop().catch(() => null);

    // Insert 1 lakh docs
    let t = ms();
    const docs = Array.from({ length: N }, (_, i) => ({
      studentId: i + 1,
      name: `Student_${i + 1}`,
      email: `student${i + 1}@university.edu`,
      age: 18 + Math.floor(Math.random() * 15),
    }));
    await col.insertMany(docs, { ordered: false });
    console.log(`Inserted ${N} docs in ${elapsed(t)}`);

    // 1) CollScan
    t = ms();
    const coll = await col.find({ age: { $gt: 25 } }).explain("executionStats");
    const collMs = Date.now() - t;
    console.log("CollScan:", {
      stage: stage(coll),
      docsExamined: coll.executionStats.totalDocsExamined,
      nReturned: coll.executionStats.nReturned,
      timeMs: collMs,
    });

    // 2) express IXScan (index on age)
    await col.createIndex({ age: 1 });
    t = ms();
    const ix = await col.find({ age: { $gt: 25 } }).explain("executionStats");
    const ixMs = Date.now() - t;
    console.log("IXScan(age):", {
      stage: stage(ix),
      docsExamined: ix.executionStats.totalDocsExamined,
      nReturned: ix.executionStats.nReturned,
      timeMs: ixMs,
    });

    // 3) IXScan with unique index
    await col.createIndex({ studentId: 1 }, { unique: true });
    t = ms();
    const uix = await col.find({ studentId: 50000 }).explain("executionStats");
    const uixMs = Date.now() - t;
    console.log("IXScan(unique studentId):", {
      stage: stage(uix),
      docsExamined: uix.executionStats.totalDocsExamined,
      nReturned: uix.executionStats.nReturned,
      timeMs: uixMs,
    });

    // List indexes
    console.log("Indexes:", await col.listIndexes().toArray());

    // Quick analysis
    console.log("Analysis:", {
      collScanMs: collMs,
      ixScanMs: ixMs,
      uniqueIxScanMs: uixMs,
      ixVsCollImprovement: `${(((collMs - ixMs) / collMs) * 100).toFixed(2)}%`,
      uniqueVsCollImprovement: `${(((collMs - uixMs) / collMs) * 100).toFixed(
        2
      )}%`,
    });
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await client.close();
  }
}

run();
