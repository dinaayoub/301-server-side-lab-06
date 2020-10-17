'use strict';

//dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent')
const app = express();
const pg = require('pg');
const { response } = require('express');
app.use(cors());

//environment variables
const PORT = process.env.PORT;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const HIKINGPROJECT_API_KEY = process.env.HIKINGPROJECT_API_KEY;
const CLIENT = new pg.Client(process.env.DATABASE_URL);

// simple server route to give us our "homepage"
app.get('/', (request, response) => {
  response.send('Hello and welcome to my homepage');
});
// Example valid URL: http://localhost:3000/location?city=seattle
app.get('/location', handleLocation);
// Example valid URL: http://localhost:3000/weather?city=seattle
app.get('/weather', handleWeather);
//Example valid URL: http://localhost:3000/trails?latitude=47.6038321&longitude=-122.3300624
app.get('/trails', handleTrails);
// Example valid URL: http://localhost:3000/movies?city=seattle
app.get('/movies',handleMovies);
// Example valid URL: http://localhost:3000/yelp?city=seattle
app.get('/yelp',handleYelp);
//catch all if they go anywhere but the supported routes
app.get('*', (request, response) => {
  response.status(404).send(new ErrorMessage(404,"Catch All"));
});


function ErrorMessage(status, source) {
  this.status = status;
  switch (status) {
    case 404:
      this.responseText = 'Oops, we can\'t find that page! Source: ' + source;
      break;
    default:
      this.responseText = 'Sorry, something went wrong. Source: ' + source;
  }
}


// Constructors for all of the objects we create
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

function Weather(dayData) {
  this.forecast = dayData.weather.description;
  this.time = dayData.valid_date;
}

function Trail(trailData) {
  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.starVotes;
  this.summary = trailData.summary;
  this.trail_url = trailData.trail_url;
  this.conditions = trailData.conditionStatus;
  //if there are condition details, append them to conditions such that it shows both condition status and details.
  if (trailData.conditionDetails) {
    this.conditions += ' - ' + trailData.conditionDetails;
  }
  //slice off everything up to the space
  this.condition_time = trailData.conditionDate.slice(trailData.conditionDate.indexOf(' '));
  this.condition_date = trailData.conditionDate.replace(this.condition_time, '');
  this.condition_time = this.condition_time.substring(1);
}

function Movie(movieData) {
  this.title = movieData.title;
  this.overview = movieData.overview;
  this.average_votes = movieData.vote_average;
  this.total_votes = movieData.vote_count;
  //if no poster_path is provided, leave image_url null so that the front end doesn't show a broken image.
  this.image_url = movieData.poster_path? 'https://image.tmdb.org/t/p/w500' + movieData.poster_path : null;
  this.popularity = movieData.popularity;
  this.released_on = movieData.release_date;
}

function Restaurant(restaurantData) {
  this.name = restaurantData.name;
  this.image_url = restaurantData.image_url;
  this.price = restaurantData.price;
  this.rating = restaurantData.rating;
  this.url = restaurantData.url;
}

function handleLocation(request, response) {
  const city = request.query.city;
  const SQL = `SELECT * FROM locations WHERE search_query='${city}';`;

  CLIENT.query(SQL)
    .then(results => {
      // check if any rows have been returned
      if (results.rowCount) {
        //Results rowcount is not 0. send back the results in JSON format.
        response.json(results.rows[0]);
      } else {
        //Results rowcount is 0. Get the data from the API then save it
        try {
          const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;

          superagent.get(url)
            .then(data => {
              const geoData = data.body[0];
              const locationData = new Location(city, geoData);

              //add it to the cache here
              const SQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4) RETURNING *;';
              const locationArray = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];

              CLIENT.query(SQL,locationArray)
                .then(() => {
                  response.json(locationData);
                })
                .catch(err => {
                  console.log('database error: ',err);
                });
            })
            .catch(err => {
              console.error('API returned error: ', err);
              response.status(404).send(new ErrorMessage(404,'handleLocation'));
            });
        } catch (error) {
          response.status(500).send(new ErrorMessage(500),'handleLocation');
        }
      }
    })
    .catch(err => {
      console.error('connection error: ', err);
    });
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
      .catch(err => {
        console.error('API returned error: ', err);
        response.status(404).send(new ErrorMessage(404,'handleWeather'));
      });
  } catch (error) {
    response.status(500).send(new ErrorMessage(500,'handleWeather'));
  }
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
      .catch(err => {
        console.error('API returned error: ', err);
        response.status(404).send(new ErrorMessage(404,'handleTrails'));
      });
  } catch (error) {
    console.log(error);
    response.status(500).send(new ErrorMessage(500,'handleTrails'));
  }
}

function handleMovies(request,response) {
  try{
    var city = request.query.search_query;
    if (!city) city = request.query.city;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${city}`
    superagent.get(url)
      .then(rawData => {
        var movieData = rawData.body.results.map(movie => new Movie(movie));
        response.json(movieData);
      }).catch(error => {
        console.error('Movie API returned error: ', error)
        response.status(404).send(new ErrorMessage(404,'handleMovies'));
      });
  } catch (error) {
    console.error('Movie API returned error: ', error)
    response.status(500).send(new ErrorMessage(500,'handleMovies'));
  }
}

function handleYelp(request,response) {
  try{
    var city = request.query.search_query;
    if (!city) city = request.query.city;
    //if a page number is passed, use it. Otherwise default to the first page.
    var page = request.query.page? request.query.page : 1;
    var offset = (page - 1) * 5;
    const url = `https://api.yelp.com/v3/businesses/search?location=${city}&limit=5&offset=${offset}`;
    superagent.get(url)
      .set('Authorization','Bearer ' + YELP_API_KEY)
      .then(rawData => {
        var restaurantData = rawData.body.businesses.map(restaurant => new Restaurant(restaurant));
        response.json(restaurantData);
      }).catch(error => {
        console.error('Yelp API returned error: ', error)
        response.status(404).send(new ErrorMessage(404,'handleYelp'));
      });
  } catch(error) {
    console.error('Yelp API returned error: ', error)
    response.status(500).send(new ErrorMessage(500,'handleYelp'));
  }
}



//connect to the db
CLIENT.connect()
  .then(() => {
    // start the server if the db connection worked!
    // configure our app to accept and listen for incoming traffic
    app.listen(PORT, () => {
      console.log(`server up: ${PORT}`);
    });
  })
  .catch(err => {
    //throw an error because we could not connect to the database
    console.error('connection error: ', err);
  });


