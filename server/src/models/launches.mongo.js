const mongoose = require('mongoose');

const launchesSchema = mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate:  {
    type: Date,
    required: true,
  },
  destination: {
    type: String, 
  },
  customers: [ String ],
  upcoming: {
    type: Boolean, 
    required: true,
  },
  success: {
    type: Boolean, 
    default: true,
    required: true,
  },
});

// Connects launchesSchema with the "Launches" collection
module.exports = mongoose.model('Launch', launchesSchema);