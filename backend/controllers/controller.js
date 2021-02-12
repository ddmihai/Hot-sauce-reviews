const User = require('../schema/user');
const jwt = require('jsonwebtoken');
const Sauce = require('../schema/sauce');

//====BCRIPT FOR HASHING THE PASSWORD==== 
const bcrypt = require('bcrypt');
const user = require('../schema/user');
const saltRounds = 10;

// body parser
const bodyParser = require('body-parser');

const multer = require('../middleware/multer');

// ====USER CONTROLLERS FOR SIGNUP AND LOGIN====
exports.signUp = (req, res, next) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(() => {
          res.status(201).json({
            message: 'Success registration'
          })
        })
        .catch((error) => {
          res.status(400).json({
            error: error
          })
        })
    });
  };

// ====LOGIN MIDDLEWARE====
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }).then(
      (user) => {
        if (!user) {
          return res.status(401).json({error: new Error('Invalid User')})
        }
        bcrypt.compare(req.body.password, user.password).then(
          (valid) => {
            if (!valid) {
              res.status(401).json({error: new Error('Incorrect password')})
            }
            const token = jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' });
  
            res.status(200).json({
              userId: user.id,
              token: token
            })
          }
        ).catch((error) => {
          res.status(500).json({
            error: error
          })
        });
      }
    ).catch((error) => {
      res.status(500).json({
        error: error
      })
    })
  };

// ====GET ALL SAUCES====
  exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
      (sauces) => {
        res.status(200).json( sauces )
      }
    ).catch((error) => {
      res.status(404).json({
        error: error
      })
    });
}



// ====POST A SAUCE====
exports.postSauce = (req, res, next) => {
  const body  = JSON.parse( req.body.sauce);

  const url = req.protocol + '://' + req.get('host');
  const file =  req.file.filename;
  const imageURL = url + './images/' + file;

  const sauce = new Sauce({
    userId:             body.userId,
    name: body.name,
    manufacturer:       body.manufacturer,
    description:        body.description,
    mainPepper:         body.mainPepper,
    imageUrl:                imageURL,
    heat:               body.heat
  });

  sauce.save().then( () => {
    res.status(201).json(
     {message: 'Successfuly added sauce'}
    )
  })
  .catch((error) => {
    res.status(500).json({ error: console.log(error)})
  })
}


// ====GET A SINGLE SAUCE====
exports.getAsauce = (req, res, next) => {
  Sauce.findOne({ 
    _id: req.params.id
   }).then(
     (sauce) => {
       res.status(200).json(sauce);
     }
   ).catch((error) => {
     res.status(500 ).json({
       error: console.log(error)
     })
   })
}



// ==== UPDATE A SAUCE ====
exports.update = (req, res, next) => {
  const sauce = new Sauce({
    _id:              req.params.id,
    name:             req.body.name,
    manufacturer:     req.body.manufacturer,
    description:      req.body.description,
    mainPepper:       req.body.mainPepper,
    imageUrl:         req.body.imageUrl,
    heat:             req.body.heat
  });

  Sauce.updateOne({ _id: req.params.id }, sauce)
  .then(() => {
    res.status(201).json({
      message: 'Updated'
    })
  })
  .catch( (error) => {
    res.status(500).json({
      error: console.log(error)
    })
  })
};


exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
       .then(() => {
         res.status(200).json({
           message: 'Deleted'
         })
       })
       .catch((error) => {
         res.status(400).json({
           error: console.log(error)
         })
       })
};


exports.likeSauce = (req, res, next) => {  
    // get the body
   const body          = req.body;
  // get the arrays of users
  let usersLiked      = new Array;
  let usersDisliked   = new Array;
                 
  let likes = 0;
  let dislikes = 0;

if (body.like == 1) {
      likes += 1;
      usersLiked.push(body.userId);
    }
if (body.like == -1) {
    dislikes += 1;
    usersDisliked.push(body.userId);
}


    const sauce = new Sauce({
      _id:              req.params.id,
      userId:           body.userId,
      likes:            likes,
      dislikes:         dislikes,
      usersLiked:       usersLiked,
      usersDisliked:    usersDisliked
    });
    
    Sauce.updateOne({ _id:req.params.id}, sauce).then(
      () => {
        res.status(201).json({
          message: 'Updated'
        })
      }
    ).catch((error) => {
      res.status(500).json({
        error: console.log(error)
      })
    });

    console.log(sauce);
    console.log(body);

}
