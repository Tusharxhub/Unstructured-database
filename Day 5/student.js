//! Write the MongoDB query to insert 1 lakh docs using find & calculate the execution time with indexes & without indexes & perform an analysis within the following techniques:
//! 1) CollScan
//! 2) express IXScan
//! 3) IXScan
//! Also create/add a unique attribute to the index while creating the index & list all the indexes for their collectionc.c



const { MongoClient } = require("mongodb");

(async () => {
  const client = new MongoClient("mongodb://localhost:27018/");
  const N = 1e5, now = Date.now;

  try {
    await client.connect();
    const col = client.db("student_db").collection("students");
    await col.drop().catch(() => {});

    let t = now();
    await col.insertMany(
      Array.from({ length: N }, (_, i) => ({
        studentId: i + 1,
        name: `Student_${i + 1}`,
        email: `student${i + 1}@university.edu`,
        age: 18 + (Math.random() * 15) | 0
      })),
      { ordered: false }
    );
    console.log(`Inserted ${N} in ${now() - t}ms`);

    const stage = (e) =>
      e.executionStats.executionStages.inputStage?.stage ||
      e.executionStats.executionStages.stage;

    const bench = async (label, query) => {
      t = now();
      const e = await col.find(query).explain("executionStats");
      const ms = now() - t;
      console.log(label, {
        stage: stage(e),
        docsExamined: e.executionStats.totalDocsExamined,
        nReturned: e.executionStats.nReturned,
        ms
      });
      return ms;
    };

    const collMs = await bench("COLLSCAN", { age: { $gt: 25 } });

    await col.createIndex({ age: 1 });
    const ixMs = await bench("IXSCAN(age)", { age: { $gt: 25 } });

    await col.createIndex({ studentId: 1 }, { unique: true });
    const uixMs = await bench("IXSCAN(unique studentId)", { studentId: 50000 });

    console.log("Indexes:", await col.listIndexes().toArray());
    console.log("Analysis:", {
      collMs,
      ixMs,
      uixMs,
      ixVsColl: `${(((collMs - ixMs) / collMs) * 100).toFixed(2)}%`,
      uniqueVsColl: `${(((collMs - uixMs) / collMs) * 100).toFixed(2)}%`
    });
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.close();
  }
})();
