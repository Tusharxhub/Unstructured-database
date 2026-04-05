//! Write the MongoDB query to insert 1 lakh docs using find & calculate the execution time with indexes & without indexes & perform an analysis within the following techniques:
//! 1) CollScan
//! 2) express IXScan
//! 3) IXScan
//! Also create/add a unique attribute to the index while creating the index & list all the indexes for their collectionc.c



const { MongoClient } = require("mongodb");

(async () => {
  const c = new MongoClient("mongodb://localhost:27018");
  const N = 100000, now = Date.now;

  try {
    await c.connect();
    const col = c.db("student_db").collection("students");
    await col.drop().catch(() => {});

    let t = now();
    await col.insertMany(
      Array.from({ length: N }, (_, i) => ({
        studentId: i + 1,
        name: `Student_${i + 1}`,
        email: `student${i + 1}@university.edu`,
        age: 18 + ((Math.random() * 15) | 0),
      })),
      { ordered: false }
    );
    console.log(`insert: ${now() - t}ms`);

    const stage = (x) =>
      x.executionStats.executionStages.inputStage?.stage ||
      x.executionStats.executionStages.stage;

    const run = async (label, q) => {
      t = now();
      const e = await col.find(q).explain("executionStats");
      console.log(label, {
        stage: stage(e), // COLLSCAN / IXSCAN / EXPRESS_IXSCAN(if chosen)
        docs: e.executionStats.totalDocsExamined,
        ret: e.executionStats.nReturned,
        ms: now() - t,
      });
    };

    await run("COLLSCAN", { age: { $gt: 25 } });

    await col.createIndex({ age: 1 });
    await run("IXSCAN(age)", { age: { $gt: 25 } });

    await col.createIndex({ studentId: 1 }, { unique: true });
    await run("UNIQUE IXSCAN(studentId)", { studentId: 50000 });

    console.log("indexes:", await col.listIndexes().toArray());
  } finally {
    await c.close();
  }
})();
