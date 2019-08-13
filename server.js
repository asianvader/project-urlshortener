'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');

const app = express();
const router = express.Router();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true}, function(error){
  if (error) {
  console.log(error);
  }
});

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

// POST => get url from form
app.post("/api/shorturl/new", (req, res) => {
  let original_url = req.body.url;

  // check to see if url starts with http(s)://www.
  if (/^https?:\/\/www./.test(original_url)) {

    // if true check to see if url is a valid domain
    // let dnsUrlCheck = original_url.replace(/^https?:\/\//, "");
    let dnsUrlCheck = new URL(original_url);
    console.log(dnsUrlCheck.hostname);
  
    dns.lookup(dnsUrlCheck.hostname, (err, value) => {
      // Not a valid domain:
      if (err) {
        res.json({error: "invalid URL"});
        console.log(err);
        return;
      }
      // a valid domain
      console.log(value);
      let longUrl = new Url({
        original_url: original_url,
        short_url: 5
      });
      longUrl
        .save()
        .then(result => {  
          console.log('added to mongo'); 
        })
        .catch(err => {
          console.log(err);
        }); 
      res.json({original_url: original_url});
    })
  } else {
    res.json({error: "invalid URL"});
  }
  

 
});

app.listen(port);