const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


app.get('/', (req,res)=>{
    res.send('CollageNest is Running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.16yxiu9.mongodb.net/?retryWrites=true&w=majority`;

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

    const collageCollection = client.db('CollageNestDB').collection('collages');
    const appliedCollageCollection = client.db('CollageNestDB').collection("appliedCollage");
    // get all collages
    app.get('/collages', async(req,res)=>{
        const result = await collageCollection.find().toArray();
        res.send(result);
    })
    // get a specific collage 
    app.get('/collages/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await collageCollection.findOne(query);
        res.send(result);
    })

    // applied toh job 
    app.post('/appliedCollage', async(req,res)=>{
      const appliedCollage = req.body;
      const result = await appliedCollageCollection.insertOne(appliedCollage);
      res.send(result);
    })

    // get applied collage 
    app.get('/myCollage', async(req,res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await appliedCollageCollection.find(query).toArray();
      res.send(result);
    })
    // handle rating
    app.put('/review/:id', async(req,res)=>{
      const review = req.body;
      const id = req.params.id;
      // console.log(updatedRecipe)
      const query = {_id:new ObjectId(id)};
      const updateDoc = {
        $set: {
          reviewDescription:review.reviewDescription,rating:review.rating
        },
      }; 
      const result = await collageCollection.updateOne(query,updateDoc);
      res.send(result)
    })

    // search collage 
    app.get('/collage/:name', async(req,res)=>{
      const collegeName = req.params.name;
      const result = await collageCollection.find({
        $or:[
          { collegeName: { $regex: collegeName, $options: "i" } }
        ]
      }).toArray();
      res.send(result)
    })

    // delete collage 
    app.delete('/collage/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await appliedCollageCollection.deleteOne(query);
      res.send(result)
    })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`CollageNest is running on port ${port}`);
})
