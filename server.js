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
  let originalUrl = req.body.url;

  // check to see if url starts with http(s)://www.
  if (/^https?:\/\/www./.test(originalUrl)) {

    // if true check to see if url is a valid domain
    let dnsUrlCheck = new URL(originalUrl);
    // console.log(dnsUrlCheck.hostname);

    dns.lookup(dnsUrlCheck.hostname, (err, value) => {
      // If not a valid domain:
      if (err) {
        res.json({error: "invalid URL"});
        console.log(err);
        return;
      }

      // if a valid domain

      // check MongoDB to see if doc exists
      let checkIfUrlExists = Url.findOne({'original_url': originalUrl}, (err, data) => {
        // if doc exists in db
        if (data) {
          console.log(data);
          res.json({
            document: "exists",
            original_url: data.original_url,
            short_url: data.short_url
          });
          return;
        }
        
        // if doc DOESN'T exist in db
        // count total documents. Increment by 1 to create short_url
        let count = 0;
        let totalUrls = Url.countDocuments({'short_url': {$gt:0}}, (err, data) => {
          count = data + 1;
          
          // create new document in MongoDB
          let longUrl = new Url({
            original_url: originalUrl,
            short_url: count
          });
          longUrl
            .save()
            .then(result => {  
              res.json({
                original_url: originalUrl,
                short_url: count
              });
            })
            .catch(err => {
              console.log("Add URL to MongoDB " + err);
            }); 
          }).catch(err => {
          console.log("totalUrls " + err);
          });
        }).catch(err => {
          console.log("Check if URL exists " + err);
        });

    })
    // invalid URL input in form
  } else {
    res.json({error: "invalid URL"});
  }
  

 
});

app.listen(port);