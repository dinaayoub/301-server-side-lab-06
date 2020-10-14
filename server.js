'use strict';

//dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent')
const app = express();
app.use(cors());

//environment variables
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const HIKINGPROJECT_API_KEY = process.env.HIKINGPROJECT_API_KEY;


// simple server route to give us our "homepage"
app.get('/', (request, response) => {
  response.send('Hello and welcome to my homepage');
});

function ErrorMessage(status) {
  this.status = status;
  switch (status) {
    case 404:
      this.responseText = 'Oops, we can\'t find that page!';
      break;
    default:
      this.responseText = 'Sorry, something went wrong';
  }
}

// Example valid URL: http://localhost:3000/location?city=seattle
app.get('/location', handleLocation);

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function handleLocation(request, response) {
  const city = request.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;

  //check if it's in the cache here!
  // if (it's in thne cache) {} else {.... this stuff:
  try {
    superagent.get(url)
      .then(data => {
        const geoData = data.body[0];
        const locationData = new Location(city, geoData);
        //add it to the cache here

        response.json(locationData);
      })
      .catch(err => console.error('returned error:', err));
  } catch (error) {
    response.status(500).send(new ErrorMessage(500));
  }
}

// Example valid URL: http://localhost:3000/weather?city=seattle
app.get('/weather', handleWeather);

function Weather(dayData) {
  this.forecast = dayData.weather.description;
  this.time = dayData.valid_date;
}


function handleWeather(request, response) {
  try {
    var city = request.query.search_query;
    if (!city) city = request.query.city;
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?key=${WEATHERBIT_API_KEY}&days=8&city=${city}`;
    superagent.get(url)
      .then(rawData => {
        var weatherData = rawData.body.data.map(date => new Weather(date));
        response.json(weatherData);
      })
      .catch(err => console.error('returned error:', err));
  } catch (error) {
    response.status(500).send(new ErrorMessage(500));
  }
}

//Example valid URL: http://localhost:3000/trails?latitude=47.6038321&longitude=-122.3300624
app.get('/trails', handleTrails);

function Trail(trailData) {
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.trail_url;
  this.conditions = trailData.conditionStatus;
  if (trailData.conditionDetails) {
    this.conditions += ' - ' + trailData.conditionDetails;
  }
  this.condition_time = trailData.conditionDate.slice(trailData.conditionDate.indexOf(' '));
  this.condition_date = trailData.conditionDate.replace(this.condition_time, '');
  this.condition_time = this.condition_time.substring(1);
}

function handleTrails(request, response) {
  try {
    var lat = request.query.latitude;
    var lon = request.query.longitude;
    const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${HIKINGPROJECT_API_KEY}`;
    superagent.get(url)
      .then(rawData => {
        var trailData = rawData.body.trails.map(trail => new Trail(trail));
        response.json(trailData);
      })
      .catch(err => console.error('returned error:', err));
  } catch (error) {
    console.log(error);
    response.status(500).send(new ErrorMessage(500));
  }
}

//catch all if they go anywhere but the supported routes
app.get('*', (request, response) => {
  response.status(404).send(new ErrorMessage(404));
});

// configure our app to accept and listen for incoming traffic
app.listen(PORT, () => {
  console.log(`server up: ${PORT}`);
});
