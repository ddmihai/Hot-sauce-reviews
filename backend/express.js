//====EXPRESS REQ====
const express = require('express');
const app = express();

const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));



//====DB MONGOOSE FOR SCHEMA==== 
const mongoose = require('mongoose');

//====BCRIPT FOR HASHING THE PASSWORD==== 
const bcrypt = require('bcrypt');
const saltRounds = 10;

//====BODY PARSER====
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
const { json } = require('body-parser');

// ====JSON WEB TOKEN IMPORT===
const jwt = require('jsonwebtoken');



//====MONGOOSE CONNECTION====
mongoose.connect('mongodb+srv://daniel:windows@cluster0.qzkml.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });
mongoose.set('useCreateIndex', true);


//====CORS HEADER SETTINGS====
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});



// ====REQUIRE THE ROUTES====
const routesModules = require('./routes/routers');
const sauce = require('./schema/sauce');

// LOGIN AND SIGNUP
app.use('/api', routesModules);
app.get('/', routesModules);
  


// ADD A SAUCE IN THE DATABASE 
app.use('/api', routesModules);

//  GET A SINGLE SAUCE
app.get('/api/', routesModules); 

//  MODIFY A SAUCE
app.use('/api', routesModules);

// DELETE ONE SAUCE
app.delete('/api', routesModules);

app.use('/api/sauces', routesModules);







module.exports = app;