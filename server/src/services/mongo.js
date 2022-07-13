const mongoose = require('mongoose');

require('dotenv').config();

// the MongoDB connection string
const MONGO_URL = process.env.MONGO_URL;

// mongoose test connection.
// the event emitter 'once' triggers the callback just once first time its executed
mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready...');
});

// mongoose errors listening.
mongoose.connection.on('error', err => {
  console.error(err);
});

async function mongoConnect() {
  // connects to mongodb. 
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  // connects to mongodb. 
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
}