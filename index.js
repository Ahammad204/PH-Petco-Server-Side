const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const petCollection = client.db('petsDB').collection('pets')
        const adoptCollection = client.db('adoptDB').collection('adopts')

        //Own MiddleWare
        //Verify Token

        const verifyToken = (req, res, next) => {

            if (!req.headers.authorization) {

                return res.status(401).send({ message: 'Forbidden Access' })

            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {

                if (err) {

                    return res.status(401).send({ message: 'Forbidden Access' })

                }
                req.decoded = decoded;
                next()

            })
        }
        // use verify admin after verifyToken
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }
        //JWT Related api
        app.post('/jwt', async (req, res) => {

            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {

                expiresIn: '1h'

            })
            res.send({ token })

        })



        //Post A Category
        app.post('/category', verifyAdmin, verifyToken, async (req, res) => {

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

        //Get admin
        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })
        //Post a Pet
        app.post('/pet', verifyToken, async (req, res) => {

            const item = req.body;
            const result = await petCollection.insertOne(item);
            res.send(result)

        })
        // Get Pet Data by Date in Descending Order
        app.get('/pet', async (req, res) => {
            try {
                const result = await petCollection.find().sort({ date: -1 }).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        });


        //Delete a Pet 
        app.delete('/pet/:id', verifyToken, async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petCollection.deleteOne(query);
            res.send(result);

        })

        //Update a pet
        app.patch('/pet/:id', verifyToken, async (req, res) => {

            const item = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {

                $set: {

                    petName: item.petName,
                    category: item.category,
                    petAge: item.petAge,
                    petLocation: item.petLocation,
                    shortDescription: item.shortDescription,
                    longDescription: item.longDescription,
                    image: item.image,

                }


            }

            const result = await petCollection.updateOne(filter, updatedDoc)
            res.send(result)

        })

        //Get A Pet
        app.get('/pet/:id', verifyToken, async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petCollection.findOne(query)
            res.send(result)

        })
        //Make Pet Adopted
        app.patch('/pet/user/:id', verifyToken, async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {

                $set: {

                    adopted: true

                }

            }
            const result = await petCollection.updateOne(filter, updatedDoc)
            res.send(result)

        })

        //Post a Adopt data
        app.post('/adopt', async (req, res) => {

            const newAdopt = req.body;
            const result = await adoptCollection.insertOne(newAdopt);
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

