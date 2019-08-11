'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();
const router = express.Router();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true}, function(error){
  console.log(error);
})


//create schema for MongoDB
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: Number
});

let Url = mongoose.model('Url', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: 'false'}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');

});



app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// get url from form
app.post("/api/shorturl/new", (req, res) => {
  let original_url = req.body.url;
  console.log(original_url);
  let longUrl = new Url({
    original_url: original_url,
    short_url: 5
  });
  longUrl
    .save()
    .then(result => {  
      // res.json(result);
    console.log('added to mongo'); 
    })
    .catch(err => {
      console.log(err);
      res.json({"error": err})
    }); 
  res.json({original_url: original_url});
});

app.listen(port);