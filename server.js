'use strict';

// "dotenv" pulls in any environment variables (process.env) that live in a .env file
// as part of this project
require('dotenv').config();

// requiring "pulling in" off the 3rd party dependencies we want to use
// ie: express -> for building APIs and related services (backend for web apps)
const express = require('express');
const cors = require('cors');
const superagent = require('superagent')

// assign express to "app" -> why? -> because everyone does that
const app = express();

// assign a PORT (or location) for accepting incoming traffic
// devs often default their dev port to 3000, 3001, or 3333 for backends
// and often default 8000 or 8080 for frontends
const PORT = process.env.PORT;

//create constants for all the API keys that are now stored in .env
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_CLIENT_ID = process.env.YELP_CLIENT_ID
const MOVIEDB_API_KEY = process.env.MOVIEDB_API_KEY;
const HIKINGPROJECT_API_KEY = process.env.HIKINGPROJECT_API_KEY;

// just "use" this -> it will allow for a public server
app.use(cors());

// simple server route to give us our "homepage"
app.get('/', (request, response) => {
  response.send('my homepage');
});

// don't focus too much on this -> just want to show you how we produce ERRORs
app.get('/unauthorized', (request, response) => {
  throw new Error('not authorized to access this route');
});

// simple/example API route
// our missing link is the location of our actual data -> ie: file or a database
// that contains the weather and the location
app.get('/test/route', (request, response) => {
  // see an API as a way to interface with data that can be used to power other applications/services
  response.json({ location: 'seattle', temp: '58 deg' });
});

function ErrorMessage(status){
  this.status = status;
  this.responseText = 'Sorry, something went wrong';
}

// http://localhost:3000/location?city=seattle
app.get('/location', handleLocation);

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function handleLocation(request, response) {
  try {
    // try to "resolve" the following (no errors)
    // we no longer want to pull from this static data file
    // we want to use a real API!
    // const geoData = require('./data/location.json');

    const city = request.query.city; // "seattle" -> localhost:3000/location?city=seattle
    const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const locationData = new Location(city, geoData);
        //unclear why we're doing this part. it's like saying in the constructor this.url = this;
        //locationData[url] = locationData;
        response.json(locationData);
      })
      .catch(err => console.error('returned error:',err));

  } catch (error) {
    console.log(error);
    // otherwise, if an error is handed off, handle it here
    response.status(500).send(new ErrorMessage(500));
  }
}
// To figure out what to format the URL as, you have to read the docs
// To add something to the header:
// superagent.set ('user-key', ZOMATO_API_KEY)


// http://localhost:3000/weather?city=seattle
app.get('/weather',handleWeather);

function Weather(city, dayData) {
  //this.search_query = city;
  //this.formatted_query = dayData.display_name;
  this.forecast = dayData.weather.description;
  this.time = dayData.valid_date;
}


function handleWeather(request, response) {
  try {
    const city = request.query.city;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHERBIT_API_KEY}&days=8&city=${city}`;
    var locationData = [];
    superagent.get(url)
      .then(rawData => {
        console.log(rawData.body);
        locationData = rawData.body.data.map(item => new Weather(city,item));
        response.json(locationData);
      })
      .catch(err =>console.error('returned error:',err));
  } catch (error) {
    console.log(error);
    response.status(500).send(new ErrorMessage(500));
  }
}

app.get('*', (request, response) => {
  // status -> did this work, where are we at in the process of delivering data
  // 404 -> "not found" status code
  // statuses live on the request and the response body
  response.status(404).send(new ErrorMessage(404));
});

// configure our app to accept and listen for incoming traffic
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});
