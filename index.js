const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const port = 3000


app.use(cors())
app.use(bodyParser.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgaci.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true });

client.connect(err => {
  const apartmentCollection = client.db(process.env.DB_NAME).collection("apartment");
  const bookingCollection = client.db(process.env.DB_NAME).collection("booking");
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

  app.get('getApartments', (req, res) => {
    apartmentCollection.find({})
    .toArray((err, docs)=>{
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



  
  client.close();
});




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})