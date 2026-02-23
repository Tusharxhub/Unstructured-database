//  ! Delete the document where the probability of predicting the gender is less than 50% for a name & put the document inti the collection "Archived" 





const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');

async function archiveAndDeleteLowProbability() {
    try {
        await client.connect();
        const db = client.db('school');
        const classmates = db.collection('classmates');
        const archived = db.collection('Archived');

        const docs = await classmates.find({ gender_probability: { $lt: 0.5 } }).toArray();

        if (docs.length === 0) {
            console.log('No documents with probability < 50% found.');
            return;
        }

        await archived.insertMany(docs);
        await classmates.deleteMany({ gender_probability: { $lt: 0.5 } });

        console.log(`${docs.length} documents archived and deleted.\n`);
        docs.forEach(doc => console.log(`- ${doc.name} (${(doc.gender_probability * 100).toFixed(2)}%)`));

    } finally {
        await client.close();
    }
}

archiveAndDeleteLowProbability().catch(console.error);
