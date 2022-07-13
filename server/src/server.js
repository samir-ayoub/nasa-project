const http = require('http');

require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  // connects to mongodb. 
  await mongoConnect();

  // here we await for the promise to be returned in order 
  // to api to listen to requests
  await loadPlanetsData();
  await loadLaunchesData();

  
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`)
  });
}

// here the await function must be stored in an async function 
// because of the commom js which do not support awaits.
// an alternative is to use a npm package, like Streams Promises API
startServer();
  