const express = require('express');
const router = express.Router();
const User = require('../schema/user');
const multer = require('../middleware/multer');

// ====AUTH MIDDLEWARE====
const authorization = require('../middleware/auth');

// ====INPORT CONTROLLER====
const controlleruser = require('../controllers/controller');


//  ==== BODY PARSER====
const bodyParser = require('body-parser');
const { route } = require('../express');
const auth = require('../middleware/auth');
const jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//====MIDDLEWARE FOR SIGNUP ACCESS====
router.post('/auth/signup', controlleruser.signUp);
router.post('/auth/login', controlleruser.login);
router.get('/sauces', controlleruser.getAllSauces);

router.post('/sauces',authorization, multer, controlleruser.postSauce);

// get a single sauce
router.get('/sauces/:id' ,authorization, controlleruser.getAsauce);

// update a sauce
router.put('/sauces/:id', authorization, multer,controlleruser.update);

// delete a sauce
router.delete('/sauces/:id', controlleruser.deleteSauce);


// Like
router.post('/:id/like',authorization, controlleruser.likeSauce);


module.exports = router;