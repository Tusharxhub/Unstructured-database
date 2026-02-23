

//! write a mongodb quary to insert the names, age, hobbies, branch of 10 classmates in mongodb.




const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function insertClassmates() {
  try {
    await client.connect();
    const database = client.db('school');
    const collection = database.collection('classmates');

    const classmates = [
      { name: 'Tushar kanti Dey', age: 20, hobbies: ['Instagram', 'gaming'], branch: 'CSE' },
      { name: 'Abhishek Singh', age: 21, hobbies: ['Gossip', 'Sleep'], branch: 'CSE' },
      { name: 'Arijit De', age: 21, hobbies: ['coding', 'music'], branch: 'CSE' },
      { name: 'Snehasish Mondal', age: 20, hobbies: ['dancing', 'writing'], branch: 'ME' },
      { name: 'Asad Iqbal', age: 21, hobbies: ['sports', 'photography'], branch: 'EE' },
      { name: 'Aditya Dey', age: 20, hobbies: ['cooking', 'gardening'], branch: 'CSE' },
      { name: 'SAmriddhi Singha', age: 21, hobbies: ['football', 'movies'], branch: 'ME' },
      { name: 'Sayan Mukharjee', age: 20, hobbies: ['yoga', 'blogging'], branch: 'ECE' },
      { name: 'Shovon Haldar', age: 21, hobbies: ['cycling', 'sketching'], branch: 'CE' },
      { name: 'Arnab Mondal', age: 20, hobbies: ['swimming', 'singing'], branch: 'CSE' }
    ];

    const result = await collection.insertMany(classmates);
    console.log(`${result.insertedCount} classmates inserted successfully!`);
  } finally {
    await client.close();
  }
}

insertClassmates().catch(console.error);