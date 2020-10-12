# City Explorer

**Author**: Dina Ayoub
**Version**: 1.0.5 (increment the patch/fix version number if you make more commits past your first submission)

## Overview

Building a server to show the user data based on the city they searched for.

## Getting Started

Using your command line type the text between the quotations:
"git clone [https://github.com/dinaayoub/city_explorer_api.git"](https://github.com/dinaayoub/city_explorer_api) to clone my github repository.
"npm install" to install all the node_modules dependencies.
"touch .env" to create a .env file, then using whichever code editor you use, open the .env file to add this line: PORT=3000
"node server.js" to run the server. It should say server up: 3000

Now, In your web browser, go to "http://localhost:3000/weather" or "http://localhost:3000/location" and you'll see the JSON results of what the API returns.
Alternatively, to see it in a GUI visit [Code Fellows City Explorer](https://codefellows.github.io/code-301-guide/curriculum/city-explorer-app/front-end/) and put in http://localhost:3000 then search for seattle

## Architecture

The application handles incoming requests and sends different responses based on the route used and the query string for the key "city"
/location?city=seattle will return data about the location
/weather?city=seattle will return the five day forecast for the location

Dependencies:

* jQuery
* express
* dotenv
* cors

## Change Log

10-12-2020 3:58 pm - Completed the README.md file
10-12-2020 3:33 pm - Added error handling
10-12-2020 3:15 pm - Added GET route for /weather
10-12-2020 2:43 pm - Added GET route for /location
10-12-2020 2:22 pm- Created basic structure and got the server up and running

## Credits and Collaborations

Started with the demo code from lecture by Brian Nations, code located here: [https://github.com/codefellows/seattle-301d67/tree/master/class-06/demo](https://github.com/codefellows/seattle-301d67/tree/master/class-06/demo)

## Time Estimates

### Number and name of feature: Feature # 1 - Repository Setup

Estimate of time needed to complete: 20 min

Start time: 1:55 pm

Finish time: 2:22 PM

Actual time needed to complete: 27 min

---------------------------------------------------------

### Number and name of feature: Feature # 2 - Locations

Estimate of time needed to complete: 30 min

Start time: 2:22 pm

Finish time: 2:43 PM

Actual time needed to complete: 21 min

---------------------------------------------------------

### Number and name of feature: Feature # 3 - Weather

Estimate of time needed to complete: 1 hour

Start time: 2:45 pm

Finish time: 3:15 PM

Actual time needed to complete: 30 min

---------------------------------------------------------

### Number and name of feature: Feature # 4 - Errors

Estimate of time needed to complete: 30 min

Start time: 3:25 pm

Finish time: 3:33 PM

Actual time needed to complete: 7 min
