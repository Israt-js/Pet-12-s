const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'pet-client-10e14.web.app'],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.Pet_Name}:${process.env.Pet_PASS}@cluster0.8ibeotr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let petCollection;
let campaignCollection;

async function connectDB() {
  try {
    await client.connect();
    const data = client.db("petDB");
    petCollection = data.collection("petCollection");
    campaignCollection = data.collection("campaignCollection");

    const pets = [
      { name: "Buddy", age: 3, location: "New York", category: "cat", image: "https://i.ibb.co/C7MP3yd/raoul-droog-y-MSec-CHs-IBc-unsplash.jpg" },
      { name: "Whiskers", age: 2, location: "Los Angeles", category: "Cat", image: "https://i.ibb.co/0GbQSkL/hang-niu-Tn8-DLxwu-DMA-unsplash.jpg" },
      { name: "Max", age: 2, location: "Chicago", category: "Dog", image: "https://i.ibb.co/zxn11wY/alvan-nee-br-Fs-Z7qsz-SY-unsplash.jpg" },
      { name: "Tom", age: 4, location: "Malaysia", category: "Dog", image: "https://i.ibb.co/B2g1FPY/cristian-castillo-73py-V0-JJOm-E-unsplash.jpg" },
      { name: "Tony", age: 3, location: "London", category: "Dog", image: "https://i.ibb.co/M8wygXH/peri-stojnic-5-Vr-RVPfb-MI-unsplash.jpg" },
      { name: "Pitter", age: 5, location: "Bangkok", category: "Cat", image: "https://i.ibb.co/8m2gRnx/nihal-karkala-vcg9-w-y-Mk-unsplash.jpg" },
    ]; 
    const campaigns = [
      { title: "Save the Cats", description: "A campaign to save stray cats in the city.", targetAmount: 10000, currentAmount: 1500, createdAt: new Date() },
      { title: "Dog Rescue Mission", description: "Helping injured dogs find new homes.", targetAmount: 20000, currentAmount: 5000, createdAt: new Date() },
      { title: "Pet Adoption Fair", description: "Organizing a fair to help pets find their forever homes.", targetAmount: 5000, currentAmount: 1200, createdAt: new Date() }
    ];

    const existingPets = await petCollection.find({}).toArray();
    if (existingPets.length === 0) {
      await petCollection.insertMany(pets);
      console.log("Initial pets data inserted!");
    }

    const existingCampaigns = await campaignCollection.find({}).toArray();
    if (existingCampaigns.length === 0) {
      await campaignCollection.insertMany(campaigns);
      console.log("Initial campaigns data inserted!");
    }

    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}
connectDB();

process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

app.get('/pet', async (req, res) => {
  try {
    const pets = await petCollection.find({}).toArray();
    res.json(pets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/pet/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const result = await petCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/adoption', async (req, res) => {
  try {
    const { petId, userId } = req.body;
    if (!petId || !userId) {
      return res.status(400).json({ message: 'Invalid adoption request' });
    }

    const adoptionRequest = { petId, userId, createdAt: new Date() };
    await petCollection.insertOne(adoptionRequest);
    res.status(201).json({ message: 'Adoption request submitted successfully' });
  } catch (error) {
    console.error('Error submitting adoption request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/campaigns', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const campaigns = await campaignCollection.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .toArray();
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/campaigns', async (req, res) => {
  try {
    const campaign = req.body;
    campaign.createdAt = new Date();
    await campaignCollection.insertOne(campaign);
    res.status(201).json({ message: 'Campaign created successfully' });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the pet adoption API!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
