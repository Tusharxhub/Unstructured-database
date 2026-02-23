//  ! Delete the document where the probability of predicting the gender is less than 50% for a name & put the document inti the collection "Archived" 





const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function archiveAndDeleteLowProbability() {
  try {
    await client.connect();
    const database = client.db('school');
    const classmates = database.collection('classmates');
    const archived = database.collection('Archived');

    // Find documents with gender probability < 50%
    const lowProbabilityDocs = await classmates.find({
      gender_probability: { $lt: 0.5 }
    }).toArray();

    if (lowProbabilityDocs.length === 0) {
      console.log('No documents with probability < 50% found.');
      return;
    }

    // Insert into Archived collection
    const insertResult = await archived.insertMany(lowProbabilityDocs);
    console.log(`${insertResult.insertedCount} documents archived.`);

    // Delete from classmates collection
    const deleteResult = await classmates.deleteMany({
      gender_probability: { $lt: 0.5 }
    });
    console.log(`${deleteResult.deletedCount} documents deleted from classmates.\n`);

    // Display archived documents
    console.log('Archived Documents:');
    lowProbabilityDocs.forEach(doc => {
      console.log(`- ${doc.name} (Probability: ${(doc.gender_probability * 100).toFixed(2)}%)`);
    });

  } finally {
    await client.close();
  }
}

archiveAndDeleteLowProbability().catch(console.error);