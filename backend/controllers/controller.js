const User = require('../schema/user');
const jwt = require('jsonwebtoken');
const Sauce = require('../schema/sauce');

const fs = require('fs');

//====BCRIPT FOR HASHING THE PASSWORD==== 
const bcrypt = require('bcrypt');
const saltRounds = 10;

//this verify the object id validation
var ObjectId = require('mongoose').Types.ObjectId;

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
  const imageURL = url + '/images/' + file;

  const sauce = new Sauce({
    userId:             body.userId,
    name:               body.name,
    manufacturer:       body.manufacturer,
    description:        body.description,
    mainPepper:         body.mainPepper,
    imageUrl:                imageURL,
    heat:               body.heat
  });

  sauce.save().then( () => {
    if (ObjectId.isValid(sauce._id)) {
      res.status(201).json(
     {message: 'Successfuly added sauce'}
    )
     }
    
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
       if (ObjectId.isValid(sauce._id)) {
        res.status(200).json(sauce);
       }
     }
   ).catch((error) => {
     res.status(500 ).json({
       error: console.log(error)
     })
   })
}


// ==== UPDATE A SAUCE ====
exports.update = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  
    let sauce = new Sauce({ _id: req.params.id });
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      body = JSON.parse(req.body.sauce);
      sauce = {
        _id: req.params.id,
        name:        body.name,
        description:  body.description,
        manufacturer: body.manufacturer,
        imageUrl:     url + '/images/' + req.file.filename,
        mainPepper:   body.mainPepper,
        heat:         body.heat
      };
      console.log(sauce);

    } else {
      
      sauce = {
        _id:          req.params.id,
        name:        req.body.name,
        description:  req.body.description,
        manufacturer: req.body.manufacturer,
        mainPepper:   req.body.mainPepper,
        heat:         req.body.heat
      };
      console.log(req.body);
      console.log(sauce);
    }
    
    Sauce.updateOne({_id: req.params.id}, sauce).then(
      () => {
        res.status(201).json({
          message: 'Sauce updated successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };

// ==== DELETE A SAUCE ====
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id:req.params.id })
  .then((sauce) => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink('images/' + filename, () => {
       Sauce.deleteOne({ _id: req.params.id })
       .then(() => {
         res.status(200).json({
           sauce: sauce
         })
       })
       .catch((error) => {
         res.status(400).json({
           error: console.log(error)
         })
       })
    })
  })
  .catch(error => console.log(error));

 
};


// ==== LIKE OR DISLIKE A SAUCE ====
exports.likeSauce = (req, res, next) => { 
  var body = req.body;

  // safe array remover function with splice
  let arrayRemover = (array, item) => {
    array.splice(array.indexOf(item), 1);
};

  Sauce.findOne({_id:req.params.id}, (err, sauce) => {
      if (err) {
        console.log(err);
      }

      else {
        if (body.like === 1) {
          if(!sauce.usersLiked.includes(body.userId)) {
            sauce.usersLiked.push(body.userId);
            sauce.likes = sauce.usersLiked.length;
            sauce.save((err) => {
              if (err) {
                console.log(err);
              }
              else {
                console.log(sauce);
                res.status(201).json({
                  message: 'Liked'
                })
              }
            })
          }
        }

        if (body.like === -1) {
          if(!sauce.usersDisliked.includes(body.userId)){
            sauce.usersDisliked.push(body.userId);
            sauce.dislikes = sauce.usersDisliked.length;
            sauce.save((err) => {
              if (err) {
                console.log(err);
              }
              else {
                console.log(sauce);
                res.status(201).json({
                  message: 'Disliked'
                })
              }
            })
          }
        }

        if (body.like === 0) {
            if (sauce.usersLiked.includes(body.userId)) {
              arrayRemover(sauce.usersLiked, body.userId);
              sauce.likes = sauce.usersLiked.length;
              sauce.save();
              
              res.status(201).json({
                message: 'Unliked'
              })
            } 
            if (sauce.usersDisliked.includes(body.userId)) {
              arrayRemover(sauce.usersDisliked, body.userId);
              sauce.dislikes = sauce.usersDisliked.length;
              sauce.save();
              
              res.status(201).json({
                message: 'Unliked'
              })
            } 
        }
      }
  })
}

