// ! Write a mongodb quary to fetch/predict the gender of your friend based on the mane that insert in previous documents & update the document  to the probabilistic gender that was predicted.





const { MongoClient } = require('mongodb');
const axios = require('axios');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function predictAndUpdateGender() {
  try {
    await client.connect();
    const database = client.db('school');
    const collection = database.collection('classmates');

    // Fetch all classmates
    const classmates = await collection.find({}).toArray();
    
    console.log('Fetching classmates and predicting gender...\n');

    for (const classmate of classmates) {
      try {
        // Call Genderize.io API to predict gender
        const response = await axios.get(`https://api.genderize.io?name=${classmate.name.split(' ')[0]}`);
        const { gender, probability } = response.data;

        // Update document with predicted gender and probability
        await collection.updateOne(
          { _id: classmate._id },
          { 
            $set: { 
              predicted_gender: gender || 'unknown',
              gender_probability: probability || 0
            } 
          }
        );

        console.log(`${classmate.name} -> Gender: ${gender || 'unknown'} (Probability: ${(probability * 100).toFixed(2)}%)`);
      } catch (error) {
        console.error(`Error predicting gender for ${classmate.name}:`, error.message);
      }
    }

    console.log('\nAll documents updated successfully!');
  } finally {
    await client.close();
  }
}

predictAndUpdateGender().catch(console.error);