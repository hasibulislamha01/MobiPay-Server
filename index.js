const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 5000;



app.use(cors({
    origin: [
        "http://localhost:5173",
        'http://localhost:5000'
    ]
}))

app.use(express.json())


const user = process.env.DB_USER
const password = process.env.DB_PASS
const secret = process.env.JWT_SECRET


const uri = `mongodb+srv://${user}:${password}@cluster0.75ieoxq.mongodb.net/?appName=Cluster0`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });


        const usersCollection = client.db('MobiPay').collection('users')
        const pendingUsersCollection = client.db('MobiPay').collection('pendingUsers')



        app.post('/users', async (req, res) => {
            const usersData = req.body
            const { userName, email, phone, role, status } = usersData

            const salt = await bcrypt.genSalt(10)
            const securedPin = await bcrypt.hash(usersData.pin, salt)

            const securedData = {
                userName,
                email,
                phone,
                role,
                securedPin,
                status
            }
            console.log(securedData)

            const result = await usersCollection.insertOne(securedData)
            res.send(result)
        })



        app.get('/users/:email', async (req, res) => {
            const userEmail = req?.params?.email
            console.log('line 75', userEmail)
            const query = { email: userEmail }
            const result = await usersCollection.findOne(query)
            res.status(200).send(result)
        })

        app.patch('/users/:email', async (req, res) => {
            const userEmail = req?.params?.email
            const filter = { email: userEmail }
            const options = { upsert: true };
            const updateDocUser = {
                $set: {
                    status: `approved`, 
                    balance: '40'

                },
            };
            // const updateDocAgent = {
            //     $set: {
            //         status: `approved`, 
            //         balance: '40'

            //     },
            // };
            const result = await usersCollection.updateOne(filter, updateDocUser, options);
            res.status(200).send(result)
        })

        app.get('/pendingUsers', async (req, res) => {
            // res.send('rote is hitting')
            const query = { status: 'pending' }
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })


        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send(`welcome user`)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})