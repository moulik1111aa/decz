
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  
  cors: {
    origin: ['http://localhost:3000', 'https://deczfinal.onrender.com/'],
    credentials: true,
    allowedHeaders: ['Access-Control-Allow-Origin']
  }
});

const uri = "mongodb+srv://moulik1111a:moulika123@moulikcluster1.dkxzhm1.mongodb.net/?retryWrites=true&w=majority&appName=MoulikCluster1";
const dbName = "DisposableForms";
const client = new MongoClient(uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function createCollection(collectionName) {
  try {
    const db = await client.connect();
    console.log('Connected to the database');
    await db.db(dbName).createCollection(collectionName);
    console.log('Collection created successfully');
  } catch (error) {
    throw error;
  }
}

const userData = {};
let currentRoom;
const emittedIDs = new Set(); // Set to keep track of emitted IDs

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("room", async (room) => {
    console.log("Joined room:", room);
    socket.join(room);
    currentRoom = room;
    socket.emit("room_sent", currentRoom); // Send the current room to the user

    if (Object.values(userData).some(data => data.room === currentRoom)) {
        const userDataForRoom = Object.values(userData).filter(data => data.room === currentRoom);
        io.to(currentRoom).emit("user_data", userDataForRoom);
    } else {
        socket.emit("room_not_found");
    }

    // Check if the collection already exists
    const db = await client.connect();
    const collectionList = await db.db(dbName).listCollections().toArray();
    const collectionExists = collectionList.some(collection => collection.name === currentRoom);
    
    // If the collection doesn't exist, create it
    if (!collectionExists) {
        await createCollection(currentRoom);
    }
  });

  socket.on("form", (formData) => {
    console.log("Data received from the client:", formData);
    socket.emit("formDataResponse", formData);

    userData[socket.id] = {
        room: currentRoom,
        data: formData
    };

    io.to(currentRoom).emit("user_data", Object.values(userData));
    console.log("Updated userData:", userData);
  });
  
  socket.on("data", async (formData) => {
    console.log("room:", currentRoom)
    console.log("data sent by the user:", formData);
    await insertData(client, currentRoom, formData, socket);
    await connectAndPrintData(io, currentRoom);
    const instruct= await printFirstDocument(currentRoom)
    socket.emit("form_to",instruct)
   
  });



  socket.on("delete_id", async (documentId) => {
    try {
      const db = client.db(dbName);
      const collection = db.collection(currentRoom);
      const result = await collection.deleteOne({ _id: ObjectId(documentId) });

      if (result.deletedCount === 1) {
        console.log('Document deleted successfully.');
      } else {
        console.log('Document not found or already deleted.');
      }

      await insertData(client, currentRoom, formData, socket);
    } catch (error) {
      console.error('Error occurred:', error);
    }
  });

  socket.on("data_joined", (formData) => {
    socket.join(currentRoom)
    console.log("room joined:",currentRoom)
    insertData(client, currentRoom, formData, socket)
  });

  socket.on("code_user",(code)=>{
     socket.emit("code_send",(code)=>{
      console.log("code sent to the user again:",code)
     })
  })

  let message_array = [];
  socket.on("message_sending", (msg) => {
    console.log("message received from the user", msg);
    message_array.push(msg);
    console.log("message sent:", message_array);
  });
  socket.on('chat_message', (message) => {
    io.emit('chat_message', message);
  });
  
});

app.use(express.static('public'));
app.use(cors());

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log("Server running on port ${PORT}");
});

async function insertData(client, currentRoom, formData, socket) {
  try {
    let data = [formData];
    console.log("room to send the data:", currentRoom);
    await client.connect();
    console.log("Connected successfully to MongoDB");
    const database = client.db("DisposableForms");
    const collection = database.collection(currentRoom);
    const result = await collection.insertMany(data);
    const ID = result.insertedIds[0];
    console.log("Inserted document ID:", ID);
    socket.emit("ID", ID);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

async function connectAndPrintData(io, room) {
  try {
    const db = await client.connect();
    console.log('Connected successfully to MongoDB');
    const cursor = db.db(dbName).collection(room).find();
    await cursor.forEach(document => {
      const documentID = document._id.toString(); // Convert ObjectId to string for comparison
      if (!emittedIDs.has(documentID)) { // Check if ID has already been emitted
        io.emit("dataBase", document);
        console.log('Emitted document:', document);
        emittedIDs.add(documentID); // Add emitted ID to the set
      }
    });
  } catch (error) {
    throw error;
  }
}

async function printFirstDocument(room) {

  try {
   
    const client = await MongoClient.connect(uri);
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection(room);
    const firstDocument = await collection.findOne({});
    console.log('First document:', firstDocument);
    client.close();
    return(firstDocument )
  } catch (err) {
    console.error('Error occurred:', err);
  
  }
}