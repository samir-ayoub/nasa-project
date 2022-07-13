const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./routes/api')

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(morgan('combined'));

// Middleware that parses json 
// and only looks at requests where the Content-Type header 
// matches the type optio
app.use(express.json());

// here the be runs the front static built files bundled by frontend with the build script
app.use(express.static(path.join(__dirname, '..', 'public')));

// the version api is defined on this way
app.use('/v1', api);

// the asteristic means that any endpoint will be accepted
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app;