const express = require('express');
const cors = require('cors');
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//port
const port = process.env.PORT || 5000;

//For knowing that server is working or not
app.get("/", (req, res) => {

 res.send("Petco is Running....")

});

//For knowing which port we are use
app.listen(port, () => {

 console.log(`Server is running on port ${port}`);

})

8.//Connect to MongoDB

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://PHPetco204:PHPetco204.@cluster0.sgu5a4t.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
 serverApi: {
     version: ServerApiVersion.v1,
     strict: true,
     deprecationErrors: true,
 }
});

async function run() {
 try {
     // Connect the client to the server	(optional starting in v4.7)
    //  await client.connect();
     // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
 } finally {
     // Ensures that the client will close when you finish/error
    // await client.close();
 }
}
run().catch(console.dir);

