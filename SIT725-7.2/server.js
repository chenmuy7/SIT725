const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const http = require('http'); // ✅ Import HTTP module to create HTTP server
const socketController = require('./socketController'); // ✅ Import the socket controller

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server with Express
const port = process.env.PORT || 3000;

// ✅ Update MongoDB URI (replace <db_password> with your actual password)
const uri = "mongodb+srv://dog:admin@cluster0.es7hk.mongodb.net/?retryWrites=true&w=majority";
let collection;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(__dirname + '/')); // Serve static files
app.use('/images', express.static(__dirname + '/images')); // Serve images folder

// Connect to MongoDB
const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
});

client.connect().then(async () => {
    const db = client.db("dog");
    collection = db.collection('dog');

    const collections = await db.listCollections().toArray();
    if (!collections.some(col => col.name === 'dog')) {
        await db.createCollection('dog');
        console.log("Collection 'dog' created");
    }

    console.log("Connected to MongoDB");
}).catch(error => {
    console.error("MongoDB Connection Error:", error);
});

// Initialize Socket.io
const io = require('socket.io'); // Import socket.io but do not initialize yet
socketController.initSocket(server); // Pass the HTTP server to socketController


// Serve frontend page
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// Fetch all dogs from MongoDB
app.get('/api/dogs', async (req, res) => {
    try {
        const dogs = await collection.find().toArray();
        res.json({ statusCode: 200, data: dogs });
    } catch (error) {
        console.error("Error retrieving dogs:", error);
        res.status(500).json({ message: 'Error retrieving dogs', error: error.message });
    }
});

// Add a new dog to the database
app.post('/api/dogs', async (req, res) => {
    try {
        let imagePath = req.body.image
        
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

// Start the server
server.listen(port, () => console.log(`Server running on port ${port}`)); // ✅ Use the HTTP server to listen

