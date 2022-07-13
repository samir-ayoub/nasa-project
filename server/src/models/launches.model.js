const axios = require('axios');
const { query } = require('express');
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading launch data...');

  // query.options.pagination= false > means that we do not want to work with pagination
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data');
    throw new Error('Launch data download failed');
  } 

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap(payload => {
      return payload['customers'];
    })

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }

  console.log(`${launch.flightNumber} ${launch.mission}`);

  await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  // first of all we check if mongoose already has made an api call to minimize the api load.
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }

}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaaunchWithId(flightNumber) {
  return await findLaunch({
    flightNumber
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne({})
    .sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  // the second argument is the projection which we set the key that should be ignored
  // the skip and limit methods are the way to handle with pagination
  return await launchesDatabase
  .find({}, { '__v': 0, '__id': 0 })
  .sort({ flightNumber: 1 })
  .skip(skip)
  .limit(limit)
}

async function saveLaunch(launch) {
  try {
    await launchesDatabase.updateOne({
      flightNumber: launch.flightNumber,
    }, launch, {
      upsert: true,
    });
  } catch (error) {
    throw new Error(`Could not save launch: , ${error}`);
  }
}

async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.destination,
  });

  if (!planet) {
    throw new Error('No matching planet found');
  }

  const newflightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = {
    ...launch,
    flightNumber: newflightNumber,
    customers: ['NASA', 'ContorPillow'],
    upcoming: true,
    success: true,
  }

  await saveLaunch(newLaunch);
}

async function abortLaunchById(flightNumber) {
  const aborted = await launchesDatabase.updateOne({
    flightNumber,
  }, {
    upcoming: false,
    success: false,
  });

  // this is provided back by mongoDB as the result of above updateOne operation
  return aborted.modifiedCount === 1;
}


module.exports = {
  saveLaunch,
  getAllLaunches,
  addNewLaunch,
  existsLaaunchWithId,
  abortLaunchById,
  loadLaunchesData,
}