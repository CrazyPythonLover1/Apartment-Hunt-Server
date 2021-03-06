const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
require('dotenv').config();
const port = 3000


app.use(cors())
app.use(bodyParser.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgaci.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

client.connect(err => {
  const apartmentCollection = client.db("Apartment-Hunt").collection("apartment");
  const bookingCollection = client.db("Apartment-Hunt").collection("booking");
  // perform actions on the collection object

  app.post('/addApartment', (req, res) => {
    const file = req.files.file;
    const body = req.body;

    const newImg = file.data;
    const encImg = newImg.toString('base64')

    var image = {
      contentType: file.mimeType,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }
    apartmentCollection.inserOne({body, image})
    .then(result => {
      res.send(result.insertedCount > 0)
    })
    return res.send({name: file.name, path: `/${file.name}`})
  })

  app.get('/getApartments', (req, res) => {
    apartmentCollection.find({})
    .toArray((err, docs)=>{
        console.log(err)
      res.status(200).send(docs);
    })
  })

  app.post('/addBooking', (req, res) => {
    const bookings = req.body;
    bookingCollection.insertOne(bookings)
    .then(result => {
      res.send(result.insertedCount > 0)
    } )

  })


  app.get('/getBookings', (req, res) => {
    bookingCollection.find({})
    .toArray((err, docs)=>{
        console.log(err)
      res.status(200).send(docs);
    })
  })


  app.get('/getUserBookingList', (req, res)=>{
      const email = req.body.email;
      bookingCollection.find({email: email})
      .toArray((err,docs)=>{
          res.status(200).send(docs);
      })
  })

  app.patch('/update-booking-status', (req, res) => {
    bookingCollection.updateOne(
      { _id: ObjectId(req.body.id) },
      { $set: { 'status': req.body.status } }
    )
      .then(result => {
        res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log(err))
  })


  
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})