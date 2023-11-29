const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
//Middleware
app.use(cors({

    origin: [

        'http://localhost:5173'

    ],
    credentials: true

}));
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

//Connect to MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sgu5a4t.mongodb.net/?retryWrites=true&w=majority`;

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

        const categoryCollection = client.db('categoryDB').collection('category')
        const usersCollection = client.db('usersDB').collection('users')


        //JWT Related api
        app.post('/jwt', async (req, res) => {

            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {

                expiresIn: '1h'

            })
            res.send({ token })

        })



        //Post A Category
        app.post('/category', async (req, res) => {

            const newCategory = req.body;
            const result = await categoryCollection.insertOne(newCategory)
            res.send(result)

        })
        //Get Category Data
        app.get('/category', async (req, res) => {

            const cursor = categoryCollection.find();
            const result = await cursor.toArray();
            res.send(result)

        })

        //Send A user data
        app.post('/users', async (req, res) => {

            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
      
              return res.send({ message: 'User already Exists', insertedId: null })
      
            }
      
            const result = await usersCollection.insertOne(user);
            res.send(result)
      
          })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

