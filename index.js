// Load Dependencies
var express = require('express');
var exphbs = require('express-handlebars');
// Load configuration from .env file
require('dotenv').config();

// Load and initialize MesageBird SDK
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);

// Set up and configure the Express framework
var app = express();
// bring in helpers
const { createAccessToken } = require('./helpers/createAccessToken');
const { performSimCheck } = require('./helpers/performSimCheck');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(express.urlencoded({ extended: true }));

// Display page to ask the user for their phone number
app.get('/', function (req, res) {
  res.render('step1');
});

// Handle phone number submission
app.post('/step2', async function (req, res) {
  var number = req.body.number;

  //create access token
  const accessToken = await createAccessToken();
  // perform SIMCheck
  const { simChanged, numberSupported } = await performSimCheck(
    number,
    accessToken
  );
  if (simChanged === true) {
    return res.render('error', {
      error:
        'Verification Failed. SIM changed too recently. Please contact support.',
    });
  }
  if (numberSupported === false) {
    return res.render('error', {
      error:
        'Verification Failed. We do not support the phone number. Please contact support.',
    });
  }
  // Make request to Verify API
  messagebird.verify.create(
    number,
    {
      originator: 'Code',
      template: 'Your verification code is %token.',
    },
    function (err, response) {
      if (err) {
        // Request has failed
        console.log(err);
        res.render('step1', {
          error: err.errors[0].description,
        });
      } else {
        // Request was successful
        console.log(response);
        res.render('step2', {
          id: response.id,
        });
      }
    }
  );
});

// Verify whether the token is correct
app.post('/step3', function (req, res) {
  var id = req.body.id;
  var token = req.body.token;

  // Make request to Verify API
  messagebird.verify.verify(id, token, function (err, response) {
    if (err) {
      // Verification has failed
      console.log(err);
      res.render('step2', {
        error: err.errors[0].description,
        id: id,
      });
    } else {
      // Verification was successful
      console.log(response);
      res.render('step3');
    }
  });
});

// Start the application
app.listen(8080);
