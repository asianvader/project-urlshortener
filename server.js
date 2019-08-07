'use strict';

require('dotenv').config();

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
const dbConn = mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true});
// console.log(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: 'false'}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.post("/api/shorturl/new", function (req, res) {
  const url = req.body.url;
  console.log(req.body);
  console.log(url);
  res.json({original_url: url});
});

app.listen(port);