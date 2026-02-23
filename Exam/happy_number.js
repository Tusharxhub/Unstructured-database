


//! Display only the documents with whose age is a happy number








const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

function isHappyNumber(n) {
    const seen = new Set();
    while (n !== 1 && !seen.has(n)) {
        seen.add(n);
        n = [...n.toString()].reduce((sum, digit) => sum + digit * digit, 0);
    }
    return n === 1;
}

async function displayHappyNumberAges() {
    try {
        await client.connect();
        const classmates = await client.db('school').collection('classmates').find({}).toArray();
        
        const happy = classmates.filter(c => isHappyNumber(c.age));
        
        if (!happy.length) {
            console.log('No happy number ages found.');
            return;
        }

        happy.forEach(doc => {
            console.log(`${doc.name}, Age: ${doc.age} ✓, ${doc.branch}, Hobbies: ${doc.hobbies.join(', ')}`);
        });

        console.log(`\nTotal: ${happy.length} classmates`);
    } finally {
        await client.close();
    }
}

displayHappyNumberAges().catch(console.error);
