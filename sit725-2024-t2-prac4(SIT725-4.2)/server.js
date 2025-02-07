const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Update MongoDB URI (replace <db_password> with your actual password)
const uri = "mongodb+srv://dog:admin@cluster0.es7hk.mongodb.net/?retryWrites=true&w=majority";
let collection;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/')); // ✅ Serve static files
app.use('/images', express.static(__dirname + '/images')); // ✅ Serve images folder

// ✅ Connect to MongoDB
const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
});

client.connect().then(async () => {
    const db = client.db("dog"); // ✅ Ensure we connect to "dog" database
    collection = db.collection('dog'); // ✅ Correct the collection name

    // ✅ Ensure "dog" collection exists
    const collections = await db.listCollections().toArray();
    if (!collections.some(col => col.name === 'dog')) {
        await db.createCollection('dog');
        console.log("Collection 'dog' created");
    }

    console.log("Connected to MongoDB");
}).catch(error => {
    console.error("MongoDB Connection Error:", error);
});

// ✅ Serve frontend page
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// ✅ Fetch all dogs from MongoDB
app.get('/api/dogs', async (req, res) => {
    try {
        const dogs = await collection.find().toArray();
        res.json({ statusCode: 200, data: dogs });
    } catch (error) {
        console.error("Error retrieving dogs:", error);
        res.status(500).json({ message: 'Error retrieving dogs', error: error.message });
    }
});

// ✅ Add a new dog to the database
app.post('/api/dogs', async (req, res) => {
    try {
        console.log("Received data:", req.body);

        let imagePath = req.body.image;
        
        // ✅ Convert local image filenames (e.g., "dog1.png") to valid URLs
        if (!imagePath.startsWith("http")) {
            imagePath = `/images/${imagePath}`;
        }

        let dog = {
            name: req.body.name,
            image: imagePath,
            info: req.body.info || "No additional info available."
        };

        await collection.insertOne(dog);
        res.status(201).json({ statusCode: 201, message: 'Dog added successfully' });
    } catch (error) {
        console.error("Error adding dog:", error);
        res.status(500).json({ message: 'Error adding dog', error: error.message });
    }
});

// ✅ Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
