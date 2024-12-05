require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5010;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iofbf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("gameDB");
    const reviewCollection = database.collection("reviews");
    const watchListCollection = database.collection("watchlist");

    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    app.get("/highest-rated-reviews", async (req, res) => {
      const cursor = reviewCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myreviews/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { userEmail };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/gamewatchlist/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { userEmail };
      const result = await watchListCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}; 
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body;
  
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateReview = {
        $set: {
          coverImage: review.coverImage,
          gameTitle: review.gameTitle,
          description: review.description,
          rating: review.rating,
          year: review.year,
          genre: review.genre,
          userEmail: review.userEmail,
          userName: review.userName,
        },
      };
  
      const result = await reviewCollection.updateOne(filter, updateReview, options);
      res.send(result);
    });








    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      console.log("New Review Item:", newReview);
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    app.post("/gamewatchlist", async (req, res) => {
      const watchListItem = req.body;
      const result = await watchListCollection.insertOne(watchListItem);
      res.send(result);
    });





    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("GameWhiz SERVER IS RUNNING");
});

app.listen(port, () => {
  console.log(`GameWhiz SERVER IS RUNNING ON PORT : ${port}`);
});
