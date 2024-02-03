const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.post('/', async (req, res) => {
    try {
        console.log('POST request:', req.body);
        const clientMessage = req.body.message;
        console.log('Client Message:', clientMessage);
        
        const updatedMessage = clientMessage + clientMessage;
        console.log('Updated Message:', updatedMessage);

        res.send({ updatedMessage });
    } catch (error) {
        console.error("Error:", error);
    }
});

app.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});

const search = async (value) => {
    if (value === "Search") {
        //Query MongoDB
    }
}





  



