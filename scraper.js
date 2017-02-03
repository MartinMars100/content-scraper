    // A key tool we'll need is the request NPM module. 
    // This module allows you to make an HTTP request 
    // and use the return value as you wish.
var request = require('request');
    // The cheerio NPM module provides a server-side jQuery implementation.
    // Cheerio's functionality mirrors the most common tasks associated with jQuery. 
    // Cheerio allows us to parse HTML with JavaScript on the server-side.
var cheerio = require('cheerio');
    // moment allows us to display dates in many formats
var moment = require('moment'); 
    // csv-write-stream helps us write to our csv file 
var csvWriter = require('csv-write-stream');
   // We use find-remove to remove the old csv file before creating a new one
var findRemoveSync = require('find-remove');
   // shirt is our global array
var shirt = []; // New Array Literal Notation
   // Below we create a data folder if one doesn't already exist
var fs = require('fs');
var dirData = './data';
var dirError = './error';

if (!fs.existsSync(dirData)){ // create data folder (for our csv) if it doesn't exist
    fs.mkdirSync(dirData);
}

function start() { // get method to shirts4mike main page
  request({
      method: 'GET',
      url: 'http://shirts4mike.com/shirts.php'  // Main page
  }, function(err, response, body) {
      if (err) {  // log errors to error file 
        console.log("There was an error connecting to the shirts4mike.com main page");
        console.log(err.hostname);
        console.log(err.code);
        var errorString = '[' + (new Date().toString()) + '] ' +'Error connecting to the shirts4mike.com main page. Error Code is ' + err.code + '\r\n';
        fs.appendFile('scraper-error.log', errorString, function (err) {
        }); 
      } else {
      // Tell Cheerio to load the HTML
      $ = cheerio.load(body);
      getHREF(); // get all of the shirt hrefs from the first t-shirt page
      updateArray(); // Use the current shirt Array to build properties title, price, and image
      }
  }); // end request
} // end start

function shirtBuild(key, href){ // build shirt array beginning with href property
  shirt[key] = new Shirt(href); 
}

function Shirt(href, title, price, image, time) { // Constructor Function
  this.title = title;
  this.price = price;
  this.image = image;
  this.href = href;
  this.time = time;
}

function getHREF(){
  $('ul[class="products"] li').each(function(key) {
    var href = $('a', this).attr("href"); // Get the href of the current(this) list
    shirtBuild(key, href); // build array with each href property
  }); // end each
  return shirt;
} // end functionOne

function updateArray() { // Update array with all of the properties 
  var result = findRemoveSync('./data', {extensions: ['.csv']}); // remove any data folder files with the csv extension 
  var date = new Date();
  var writerFile1 = csvWriter({headers: ["Title", "Price", "ImageURL", "URL", "Time"]}); //Headers for our csv file
  writerFile1.pipe(fs.createWriteStream(dirData + '/' + moment().format('MMMM Do YYYY, h:mm:ss a') + '.csv')); // This names the file stored with our csv data
  
  for (key in shirt) { // for each element in our array
    var url = 'http://shirts4mike.com/' + shirt[key].href;
    request(url, ( function(key) {    // self-executing function
      return function(err, resp, body) {
      if (err) {
        console.log("There was an error connecting to the shirts4mike.com shirt detail page.");
        var errorString = '[' + (new Date().toString()) + '] ' +' Error connecting to the shirts4mike.com shirt detail page. The Error Code is ' + err.code  +'\r\n';
        fs.appendFile('scraper-error.log', errorString, function (err) {
        }); 
      } else {
        $ = cheerio.load(body);
        var title = $('title').text(); 
        var price  = $('.price').text(); 
        var image  = $('img').attr("src"); 
        shirt[key].title = title; // Update all of our properites
        shirt[key].price = price;
        shirt[key].image = image;
        shirt[key].time = date.toTimeString();
        writerFile1.write([shirt[key].title, shirt[key].price, shirt[key].image, shirt[key].href, shirt[key].time]);
        } // end else
      }; // end request
      })(key));
    } // end for
} // end updateArray function

start();
