//! Write the MongoDB query to insert 1 lakh docs using find & calculate the execution time with indexes & without indexes & perform an analysis within the following techniques:
//! 1) CollScan
//! 2) express IXScan
//! 3) IXScan
//! Also create/add a unique attribute to the index while creating the index & list all the indexes for their collectionc.c



const { MongoClient } = require("mongodb");

(async () => {
  const c = new MongoClient("mongodb://localhost:27018"), N = 1e5;
  const s = (x) => x?.stage || s(x?.inputStage) || s(x?.innerStage);
  try {
    await c.connect();
    const col = c.db("student_db").collection("students");
    await col.drop().catch(() => {});

    let t = Date.now();
    await col.insertMany(
      Array.from({ length: N }, (_, i) => ({
        studentId: i + 1,
        name: `Student_${i + 1}`,
        email: `student${i + 1}@university.edu`,
        age: 18 + ((Math.random() * 15) | 0),
      }))
    );
    console.log("insert:", Date.now() - t, "ms");

    const run = async (label, q) => {
      t = Date.now();
      const e = await col.find(q).explain("executionStats");
      console.log(label, {
        stage: s(e.executionStats.executionStages),
        docs: e.executionStats.totalDocsExamined,
        ret: e.executionStats.nReturned,
        ms: Date.now() - t,
      });
    };

    await run("COLLSCAN", { age: { $gt: 25 } });
    await col.createIndex({ age: 1 });
    await run("IXSCAN", { age: { $gt: 25 } });
    await col.createIndex({ studentId: 1 }, { unique: true });
    await run("UNIQUE/EXPRESS IXSCAN", { studentId: 50000 });

    console.log(await col.listIndexes().toArray());
  } finally {
    await c.close();
  }
})();
