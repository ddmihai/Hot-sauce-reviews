const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const unique = require('mongoose-unique-validator');


// create a user schema
const user = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// use the unique plugin for the user schema
user.plugin(unique);


// Export the user with the 'User' name
module.exports = mongoose.model('User', user);







