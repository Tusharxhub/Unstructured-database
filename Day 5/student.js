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

(async () => {
  const client = new MongoClient(URI);
  const now = () => Date.now();

  try {
    await client.connect();
    const col = client.db(DB).collection(COL);
    await col.drop().catch(() => {});

    const tIns = now();
    await col.insertMany(
      Array.from({ length: N }, (_, i) => ({
        studentId: i + 1,
        name: `Student_${i + 1}`,
        email: `student${i + 1}@university.edu`,
        age: 18 + Math.floor(Math.random() * 15),
      })),
      { ordered: false }
    );
    console.log(`Inserted ${N} docs in ${now() - tIns}ms`);

    const getStage = (e) =>
      e.executionStats.executionStages.inputStage?.stage ||
      e.executionStats.executionStages.stage;

    const t1 = now();
    const coll = await col.find({ age: { $gt: 25 } }).explain("executionStats");
    const collMs = now() - t1;
    console.log("CollScan:", {
      stage: getStage(coll),
      docsExamined: coll.executionStats.totalDocsExamined,
      nReturned: coll.executionStats.nReturned,
      ms: collMs,
    });

    await col.createIndex({ age: 1 });
    const t2 = now();
    const ix = await col.find({ age: { $gt: 25 } }).explain("executionStats");
    const ixMs = now() - t2;
    console.log("IXScan(age):", {
      stage: getStage(ix),
      docsExamined: ix.executionStats.totalDocsExamined,
      nReturned: ix.executionStats.nReturned,
      ms: ixMs,
    });

    await col.createIndex({ studentId: 1 }, { unique: true });
    const t3 = now();
    const uix = await col.find({ studentId: 50000 }).explain("executionStats");
    const uixMs = now() - t3;
    console.log("IXScan(unique studentId):", {
      stage: getStage(uix),
      docsExamined: uix.executionStats.totalDocsExamined,
      nReturned: uix.executionStats.nReturned,
      ms: uixMs,
    });

    console.log("Indexes:", await col.listIndexes().toArray());
    console.log("Analysis:", {
      collMs,
      ixMs,
      uixMs,
      ixVsColl: `${(((collMs - ixMs) / collMs) * 100).toFixed(2)}%`,
      uniqueVsColl: `${(((collMs - uixMs) / collMs) * 100).toFixed(2)}%`,
    });
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.close();
  }
})();
