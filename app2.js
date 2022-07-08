require("dotenv").config()
const express = require("express");
var cron = require('node-cron');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const alert = require("alert");
var nodemailer = require('nodemailer');
const passportLocalMongoose = require("passport-local-mongoose");
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.jwt_secret;
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "mynewsecret",
  resave: false,
  saveUninitialized: false
}));


var today = new Date();
var year = today.getFullYear();
console.log(year);

var leap;
var i = 0;
if (year % 4 == 0) {
  if (year % 100 == 0) {
    if (year % 400 == 0)
      leap = true;
    else
      leap = false;
  } else
    leap = true;
} else
  leap = false;

console.log(leap);

app.use(passport.initialize());
app.use(passport.session());
// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://sukhbir_13:abcd@cluster0.9p3kj.mongodb.net/lilearn?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



app.use(express.urlencoded({
  extended: false
}));

const teacherSchema = new mongoose.Schema({
  email:String,
  password:String,
  fname:String,
  lname:String,
  dob:String,
  designation:String,
  reminder:String,
  img:
   {
       data: Buffer,
       contentType: String
   },
  studentID:Number,
    class: {
      type: [Number],
      index: true,
      unique: false
    }
});
const userSchema = new mongoose.Schema({

  email: String,
  password: String,
  fname: String,
  lname: String,
  city: String,
  dob: String,
  gender: String,
  contact: String,
  flag: Number,
  thought:Number,
	username:String,
  studentID:{type:Number, default:4000},
  teacherID:{type:Number, default:200},

  googleId: String,
  facebookId: String,
  githubId: String,
  confirmed:{
      type:Boolean,
      default:false
  }
});
const scoreSchema = {
  fname: String,
  lname: String,
  count: Number,
  email: String,
  score: Number,


  January: {
    type: [Number],
    index: true,
    unique: false
  },
  February: {
    type: [Number],
    index: true,
    unique: false
  },
  March: {
    type: [Number],
    index: true,
    unique: false
  },
  April: {
    type: [Number],
    index: true,
    unique: false
  },
  May: {
    type: [Number],
    index: true,
    unique: false
  },
  June: {
    type: [Number],
    index: true,
    unique: false
  },
  July: {
    type: [Number],
    index: true,
    unique: false
  },
  August: {
    type: [Number],
    index: true,
    unique: false
  },
  September: {
    type: [Number],
    index: true,
    unique: false
  },
  October: {
    type: [Number],
    index: true,
    unique: false
  },
  November: {
    type: [Number],
    index: true,
    unique: false
  },
  December: {
    type: [Number],
    index: true,
    unique: false
  },
  Star: {
    type: [Number],
    index: true,
    unique: false
  },
  Pie: {
    type: [Number],
    index: true,
    unique: false
  },

};
const Score = new mongoose.model("Score", scoreSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Teacher = new mongoose.model("Teacher", teacherSchema);


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



var gfname="";
passport.use(new GoogleStrategy({
  clientID: process.env.google_client,
  clientSecret: process.env.google_secret,
    callbackURL: "https://www.lillearn.com/auth/google/final",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
     console.log(profile);
    gfname=profile.name.givenName;
          User.findOne({username:profile.emails[0].value},function(err,foundUser){
if(!err){
        if(foundUser){
return cb(null,foundUser);
        }


        else
        {

    User.findOrCreate({
      username: profile.emails[0].value,
      googleId: profile.id,
      email: profile.emails[0].value,
      lname: profile.name.familyName,
      fname: profile.name.givenName
    }, function(err, user) {
      return cb(err, user);
    } );
        } }
  } ) ;
  }  )    );




















// passport.use(new FacebookStrategy({
//     clientID: "228431839468988",
//     clientSecret: "7a7dcdf037c45e16694897737284b631",
//     callbackURL: 'http://localhost:3000/auth/facebook/final',
//     profileFields: ['id', 'displayName', 'email', 'name', 'gender']
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     console.log(profile);
//      console.log(profile.emails);
//     User.findOrCreate({
//       username: profile.id,
//       facebookId: profile.id,
//       fname: profile.name.givenName,
//       lname: profile.name.familyName,
//       email: profile.emails[0].value
//     }, function(err, user) {
//       return cb(err, user);
//     });
//   }));
//
//

var facefname="";
  passport.use(new FacebookStrategy({
    clientID:process.env.face_client,
    clientSecret: process.env.face_secret,
    callbackURL: 'https://www.lillearn.com/auth/facebook/final',
    profileFields:['id','displayName','email','name','gender']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    console.log(profile.emails[0].value)
    facefname=profile.name.givenName;
    User.findOrCreate({
      username:profile.emails[0].value,
      facebookId: profile.id,
      fname:profile.name.givenName,
      lname:profile.name.familyName,
      email:profile.emails[0].value
    }, function(err, user) {
      return cb(err, user);
    });
  }));

  app.get("/alpha",function(req,res){
    res.sendFile(__dirname+"/alphabets.html");
  });
  app.get("/number",function(req,res){
    res.sendFile(__dirname+"/numbers.html");
  });
  app.get("/shape",function(req,res){
    res.sendFile(__dirname+"/shapes.html");
  });
  app.get("/transport",function(req,res){
    res.sendFile(__dirname+"/transports.html");
  });
  app.get("/occupation",function(req,res){
    res.sendFile(__dirname+"/occupations.html");
  });
  app.get("/fruit",function(req,res){
    res.sendFile(__dirname+"/fruits.html");
  });
  app.get("/veg1",function(req,res){
    res.sendFile(__dirname+"/veg1.html");
  });
  app.get("/veg2",function(req,res){
    res.sendFile(__dirname+"/veg2.html");
  });
  app.get("/multi",function(req,res){
    res.sendFile(__dirname+"/multiply.html");
  });
  app.get("/addition",function(req,res){
    res.sendFile(__dirname+"/addition.html");
  });
  app.get("/subtraction",function(req,res){
    res.sendFile(__dirname+"/subtraction.html");
  });
  app.get("/animal",function(req,res){
    res.sendFile(__dirname+"/animal.html");
  });
  app.get("/solar",function(req,res){
    res.sendFile(__dirname+"/solar.html");
  });
  app.get("/body",function(req,res){
    res.sendFile(__dirname+"/body.html");
  });
app.get("/lessons",function(req,res){
  res.sendFile(__dirname+"/lessons.html");
});

app.get("/auth/facebook",
  passport.authenticate('facebook', {
    scope: ['email']
  }));

app.get("/auth/facebook/final",
  passport.authenticate('facebook', {
    failureRedirect: "/login"
  }),
  function(req, res) {
    console.log(req.user, req.isAuthenticated());
    res.render("welcome",{fname:facefname});
  });

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/home.html");
});

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ['profile', 'email']

  })
);

const newTeacher = new Teacher(
  {
    email:"sample@teacher.com",
    password:"12345",
    fname:"Rajesh",
    lname:"Arora",
    subject:"Science",
    studentID:4000,
  });

app.get("/auth/google/final",
  passport.authenticate('google', {
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.render("welcome", {
      fname: gfname
    });
  });

app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.get("/signup", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});


app.get("/final", function(req, res) {
  res.render("welcome", {
    username: "nknd"
  });
});


//Update Values in MongoDB server after 24 hours
var x=0;

cron.schedule('0 0 * * *', () => {
  console.log('running when days changes');
  x=(x+1)%70;

});


app.post("/login", function(req, res) {
  const username = req.body.username;
  const user = new User({
    username: req.body.email,
    password: req.body.password
  });

  User.findOne({username:req.body.username}, function(err,found){
      if(err){
        console.log(err);
        console.log("ERRORS IN LOGGING IN");
      }else{
          if(found){
              if(!found.confirmed){

                  res.sendFile(__dirname+"/login3.html");
              }
              else{
                req.login(user, function(err) {
                  if (err) {

                    console.log(err);
                    console.log("ERRORS");
                  } else {
                    passport.authenticate("local")(req, res, function() {
                      console.log("SUCCESS");

                      var type=req.body.login_as;
                      if(type=="Teacher"){
                        res.send("Logged in as a teacher");
                        }else{
                          res.redirect("/final");
        }

                      Score.findOne({
                          email: username
                        }, function(err, foundUser) {
                          if (err) {
                            console.log(err);
                            console.log("ERRORS IN LOGGING IN");
                          } else {
                            if (foundUser) {

                              console.log(foundUser.score);
                              console.log(foundUser.fname);
                              console.log(foundUser.lname);
                              // console.log(foundUser.gender);
                              // console.log(foundUser.dob);
                              res.render("welcome", {
                                  username: username,
                                  score: foundUser.score,
                                  fname: foundUser.fname,
                                  lname:foundUser.lname,
                                  gender:foundUser.gender,
                                  dob:foundUser.dob,
                                });

                            }
                          }
                        });

                    });
                  }
                });

              }
          }
	      else
	      {
                      res.sendFile(__dirname+"/login4.html");
	      }
      }
  });
  // Score.findOne({
  //   email: username
  // }, function(err, foundUser) {
  //   if (err) {
  //     console.log(err);
  //     console.log("ERRORS IN LOGGING IN");
  //   } else {
  //     if (foundUser) {
  //
  //       console.log(foundUser.score);
  //       console.log(foundUser.fname);
  //       console.log(foundUser.lname);
  //       console.log(foundUser.gender);
  //       console.log(foundUser.dob);
  //
  //
  //       res.render("welcome", {
  //         username: username,
  //         score: foundUser.score,
  //         fname: foundUser.fname,
  //         lname: foundUser.lname,
  //         gender: foundUser.gender,
  //         dob: foundUser.dob,
  //       });
  //     }
  //   }
  // });
});

app.post("/login1", function(req, res) {
  const pass1 = req.body.password;
  const pass2 = req.body.password2;
  if (pass1 === pass2) {
    res.sendFile(__dirname + "/login1.html");
  } else {
    res.send("Password does not match");
    res.sendFile(__dirname + "/reset-password.html")
  }
})
app.post("/signup", function(req, res) {
      const fname = req.body.fname;
      console.log(req.body.fname);
      console.log(req.body.lname);
      console.log(req.body.email);
      console.log(req.body.password);
      console.log(req.body.dob);
      console.log(req.body.gender);
      console.log(req.body.cnumber);
      console.log(req.body.city);

      User.findOne({
      username: req.body.email
          }, function(err, found) {
            if (!err) {
              if (found) {

                res.sendFile(__dirname+"/signup1.html")
              }
               else {

                 User.register({
                   username: req.body.email,
	           email:req.body.email,
                   fname: req.body.fname,
                   lname: req.body.lname,
                   dob: req.body.dob,
                   gender: req.body.gender,
                   contact: req.body.cnumber,
                   city: req.body.city,
                   flag: 0,
                   thought:x,
                 }, req.body.password, function(err, user) {
                   if (err) {
                     console.log(err);



                   } else {
                     passport.authenticate("local")(req, res, function() {
                       console.log("New User");
                     });
                     // res.render("final");

                   }
                 });

                 const newTeacher = new Teacher({
                     email:"sample@teacher.com",
                     password:"12345",
                     fname:"Rajesh",
                     lname:"Arora",
                     designation:"Science",
                     reminder:"none",
                     dob:"01/05/1990",
                     studentID:4000,
                   })
                   for (i = 1; i <= 3; i++) {
                     newTeacher.class.unshift(i);
                   }

                 const newScore = new Score({
                   email: req.body.email,
                   fname: req.body.fname,
                   score: 0,
                   count: 0,
                   lname: req.body.lname,


                 });
                 for (i = 1; i <= 31; i++) {
                   newScore.January.unshift(0);
                 }
                 if (!leap) {
                   for (i = 1; i <= 28; i++) {
                     newScore.February.unshift(0);
                   }
                 } else {
                   for (i = 1; i <= 29; i++) {
                     newScore.February.unshift(0);
                   }
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.March.unshift(0);
                 }
                 for (i = 1; i <= 30; i++) {
                   newScore.April.unshift(0);
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.May.unshift(0);
                 }
                 for (i = 1; i <= 30; i++) {
                   newScore.June.unshift(0);
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.July.unshift(0);
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.August.unshift(0);
                 }
                 for (i = 1; i <= 30; i++) {
                   newScore.September.unshift(0);
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.October.unshift(0);
                 }
                 for (i = 1; i <= 30; i++) {
                   newScore.November.unshift(0);
                 }
                 for (i = 1; i <= 31; i++) {
                   newScore.December.unshift(0);
                 }
                 for (i = 1; i <= 5; i++) {
                   newScore.Star.unshift(0);
                 }
                 for (i = 1; i <= 7; i++) {
                   newScore.Pie.unshift(0);
                 }

                 newScore.save(function(err) {
                   if (err)
                     console.log("ERRORS IN SCORE");
                   else
                     console.log("SUCCESS SCORE");
                 });

                 User.findOne({
                     username: req.body.email
                   }, function(err, found) {
                     if (!err) {
                         console.log(found);
                         const secret = jwt_secret + req.body.email;
                         const payload = {
                           email: req.body.email,
                           _id: req.body.fname
                         }
                         const token = jwt.sign(payload, secret, {
                           expiresIn: '1d'
                         })
                         const link = `https://www.lillearn.com/confirmation/${req.body.email}/${token}`;
                         console.log(link);

                         var transporter = nodemailer.createTransport({
                             service: 'gmail',
                             auth: {
                               user: 'lillearn.13@gmail.com',
                               pass: 'nfwjukmzuedravrf'
                             }
                           });

                           var mailOptions = {
                             from:"Team Lil-learn",
                             to:req.body.email,

                             subject: 'Confirm your email',
                             text: link

                           };

                           transporter.sendMail(mailOptions, function(error, info) {
                             if (error) {
                               console.log(error);
                             } else {
                               console.log('Email sent: ' + info.response);
                             }
                           });

                     } else {
                       console.log(err);
                     }
                   })
                 res.sendFile(__dirname + '/login2.html'); console.log("new");



              }
            } else {
              console.log(err);
            }
          });






      });

      app.get("/thankyou", function(req, res) {
      res.sendFile(__dirname + ('/thankyou.html'))
    })

    app.post("/check", function(req, res) {
      const username = req.body.username;
      User.findByUsername(username).then(function(sanitizedUser) {
        if (sanitizedUser) {
          const secret = jwt_secret + sanitizedUser.salt + sanitizedUser.hash;
          const payload = {
            email: sanitizedUser.email,
            _id: sanitizedUser._id
          }
          const token = jwt.sign(payload, secret, {
            expiresIn: '10m'
          })
          const link = `https://www.lillearn.com/reset-password/${sanitizedUser.username}/${token}`;
          console.log(link);

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'lillearn.13@gmail.com',
              pass: 'nfwjukmzuedravrf'
            }
          });

          var mailOptions = {
            from: "Team Lil-learn",
            to: sanitizedUser.username,

            subject: 'Reset Your Password',
            text: link

          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.send(`<h1 style="text-align:center"> Password reset link is sent to your Registered Email </h1>`);

        } else {
          res.send(`<h1 style="text-align:center"> User Not Registered!! </h1>`);
        }
      }, function(err) {
        console.error(err);
      });



    });





    app.get("/goto", function(req, res) {
      res.sendFile(__dirname + "/goto.html");
    });

    app.get("/forget", function(req, res) {
      const username1 = "s@t.com";
      newPasswordString = "sukhbir";
      User.findByUsername(username1).then(function(sanitizedUser) {
        if (sanitizedUser) {
          sanitizedUser.setPassword(newPasswordString, function() {
            sanitizedUser.save();
            res.status(200).json({
              message: 'password reset successful'
            });
          });
        } else {
          res.status(500).json({
            message: 'This user does not exist'
          });
        }
      }, function(err) {
        console.error(err);
      });


    });


    app.post('/reset-password/:username/:token', (req, res, next) => {
      const {
        username,
        token
      } = req.params;
      const {
        password,
        password2
      } = req.body;
      User.findOne({
        username: username
      }, function(err, found) {
        if (!err) {
          if (!found) {
            res.send("Invalid Id");
          } else {
            // we are having a valid user with this id
            const secret = jwt_secret + found.salt + found.hash;
            try {
              const payload = jwt.verify(token, secret);
              // p1 should be equal to p2
              //we can simply find the user with payload email and id
              //

              found.setPassword(password, function() {
                //  found.save();
                res.status(200).json({
                  message: 'password reset successful'
                });
              });


              res.send("Password updated, you can login now");
            } catch (error) {
              console.log(error.message);
              res.send(error.message);
            }
          }
        } else {
          console.log(err);
        }
      })
    });



    app.get("/reset-password/:username/:token", function(req, res) {
      const {
        username,
        token
      } = req.params;
      // check if this id exist in data base
      User.findOne({
        username: username
      }, function(err, found) {
        if (!err) {
          if (!found) {
            res.send("Invalid Id");
          } else {
            // we are having a valid user with this id
            const secret = jwt_secret + found.salt + found.hash;
            try {
              const payload = jwt.verify(token, secret);
              res.sendFile(__dirname + '/reset-password.html')

            } catch (error) {
              console.log(error.message);
              res.send(error.message);
            }
          }
        } else {
          console.log(err);
        }
      })
      // res.send(req.params);
    });


    let videos=['https://www.youtube.com/embed/w36yxLgwUOc?start=5',
'https://www.youtube.com/embed/2iXqoLPjSTg?start=5',
'https://www.youtube.com/embed/q1xNuU7gaAQ?start=5',
'https://www.youtube.com/embed/nCPPLhPTAIk?start=5',
'https://www.youtube.com/embed/XkQo0uxQTCI?start=5',
'https://www.youtube.com/embed/XkQo0uxQTCI?start=5',
'https://www.youtube.com/embed/s0bS-SBAgJI?start=5',
'https://www.youtube.com/embed/tzN299RpJHA?start=6',
'https://www.youtube.com/embed/q4NIEG_ygiM?start=28',
'https://www.youtube.com/embed/93BqLewm3bA?start=28',
'https://www.youtube.com/embed/9VtxCxtsMAI?start=28',
'https://www.youtube.com/embed/yZUeOF1UAk8?start=10',
'https://www.youtube.com/embed/CA6Mofzh7jo',
'https://www.youtube.com/embed/jF0Id-hH9y4?start=7',
'https://www.youtube.com/embed/24wO1G_7fyc?start=7',
'https://www.youtube.com/embed/dJpIU1rSOFY',
'https://www.youtube.com/embed/-84U1EsZCbY?start=3',
'https://www.youtube.com/embed/QLhKCr_qTJU?start=3',
'https://www.youtube.com/embed/5tC8OOxOFEk?start=2',
'https://www.youtube.com/embed/cDed5eXmngE?start=5',
'https://www.youtube.com/embed/n_OBLfdh3Ew?start=3',
'https://www.youtube.com/embed/_yH3BntZCSI?start=3',
'https://www.youtube.com/embed/Hnfdq2htoKU?start=3',
'https://www.youtube.com/embed/fephtrPt6wk?start=3',
'https://www.youtube.com/embed/MEb7nnMLcaA?start=3',
'https://www.youtube.com/embed/VSKSyZh3FOU?start=3',
'https://www.youtube.com/embed/VSKSyZh3FOU?start=3',
'https://www.youtube.com/embed/4hpCfHcIaQg?start=3',
'https://www.youtube.com/embed/p-B2y2I6duE?start=3',
'https://www.youtube.com/embed/X4fcI4PMvwg?start=5',
'https://www.youtube.com/embed/VX6BnTRq8Fs?start=3',
'https://www.youtube.com/embed/xmbpPWIV0VU?start=3',
'https://www.youtube.com/embed/PGiqxnAr2fQ?start=3',
'https://www.youtube.com/embed/9ex0syXAqd4?start=3',
'https://www.youtube.com/embed/d86DofYpkrY?start=3',
'https://www.youtube.com/embed/sM3FDsMAMdc?start=3',
'https://www.youtube.com/embed/v80w3htJNyQ?start=3',
'https://www.youtube.com/embed/470N1pxIZbk?start=5',
'https://www.youtube.com/embed/nHCKRGBxlf8?start=3',
'https://www.youtube.com/embed/09TRoxgVPjs?start=5',
'https://www.youtube.com/embed/jMW_0Ro6b5c?start=3',
'https://www.youtube.com/embed/QQsybALJoew?start=3',
'https://www.youtube.com/embed/EpuDYZ_g0yg?start=3',
'https://www.youtube.com/embed/SPQt5v5Xsg8?start=3',
'https://www.youtube.com/embed/JWPy9zhQLJw?start=3',
'https://www.youtube.com/embed/8If95999Zs0?start=3',
'https://www.youtube.com/embed/4b5ljmLvRlU?start=3',
'https://www.youtube.com/embed/nsEpiowHIbg?start=3',
'https://www.youtube.com/embed/l2GdFobEcbI?start=3',
'https://www.youtube.com/embed/PXBP0XYLMPA?start=3',
'https://www.youtube.com/embed/ZnEprHobSAA?start=3',
'https://www.youtube.com/embed/XbxsdbisXzU?start=3',
'https://www.youtube.com/embed/BQvo7vyCmuE?start=3',
'https://www.youtube.com/embed/5-2NLHB4Gxg?start=3',
'https://www.youtube.com/embed/SmsCJpBuNrE?start=3',
'https://www.youtube.com/embed/BYpfOKwlYS8?start=5',
'https://www.youtube.com/embed/OVcVSyjJkY4?start=3',
'https://www.youtube.com/embed/2HTZs51OYwo?start=3',
'https://www.youtube.com/embed/MQLadfsvfLo?start=3',
'https://www.youtube.com/embed/hpfiVCz1prk?start=3',
'https://www.youtube.com/embed/UXsomnDkntI?start=3',
'https://www.youtube.com/embed/ckULkfv3Hb0?start=3',
'https://www.youtube.com/embed/n9WrjIAUtVY?start=3',
'https://www.youtube.com/embed/QJZ-SfTiyNM?start=4',
'https://www.youtube.com/embed/7GI4eTUyGSM?start=3',
'https://www.youtube.com/embed/gfKp1z4sCIE?start=3',
'https://www.youtube.com/embed/clwt7iXF1Mg?start=3',
'https://www.youtube.com/embed/YKsNUl_s0XQ?start=5',
'https://www.youtube.com/embed/Vnj9Ay6xmOk?start=5',
'https://www.youtube.com/embed/tvCeSX9Pthw?start=3'
];



app.get("/facts",function(req,res){
  res.render('facts',{fact:videos[x]});
});





    app.get("/logout", function(req, res) {
      req.logout();
      res.redirect("/");
    });

    app.get("/confirmation/:username/:token", function(req, res) {
        const {
          username,
          token
        } = req.params;
        // check if this id exist in data base
        User.findOne({
          username: username
        }, function(err, found) {
          if (!err) {
            if (!found) {
              res.send("Invalid Id");
            } else {
              const secret = jwt_secret + found.username;
              try {
                const payload = jwt.verify(token, secret);
                console.log(found);
                User.update({username:found.username},{confirmed:true},function(err,doc){
                    if(err){ console.log(err); }
                    else{ console.log(doc); }
                })
                console.log("Hello Balkar");
                console.log(found);

                res.send(`<h1 style:"text-align:center;"> Successful You can Login now </h1>`);

              } catch (error) {
                console.log(error.message);
                res.send(error.message);
              }
            }
          } else {
            console.log(err);
          }
        })
        // res.send(req.params);
      });




      app.get("/csc", function(req, res) {
        res.sendFile(__dirname + "/csc.html");
      });



      app.post("/change_loc", function(req, res) {
        const username = req.body.username;
        const user = new User({
          username: req.body.email,
          password: req.body.password
        });



        User.findOne({username:req.body.username}, function(err,found){
            if(err){
              console.log(err);
              console.log("ERRORS IN LOGGING IN");
            }else{
                if(found){
                    if(!found.confirmed){

                        res.sendFile(__dirname+"/csc1.html");
                    }
                    else{
                      req.login(user, function(err) {
                        if (err) {
                          console.log(err);
                          res.sendFile(__dirname+"/csc1.html");

                          console.log("ERRORS");
                        } else {
                          passport.authenticate("local")(req, res, function() {
                            console.log("SUCCESS");
                            User.updateOne({username:username},{country:req.body.country},function(err,doc){
                              if(err){ console.log(err); }
                              else{
                                 console.log("con");
                                 console.log(doc); }
                            })
                            User.updateOne({username:username}, {state: req.body.state},function(err,doc){
                              if(err){ console.log(err); }
                              else{
                                console.log("state");
                                console.log(doc); }
                            })
                            User.updateOne({username:username}, {city:req.body.city},function(err,doc){
                              if(err){ console.log(err); }
                              else{
                                 console.log("city");
                                 console.log(doc); }
                                 res.send(`<h1 style="text-align:center"> Your Location has been updated Successfully🤗. </h1>`);
                            })


                          });
                        }
                      });

                    }
                }
            }
        });



      });
      app.get("/thankyou",function(req,res){
        res.sendFile(__dirname+"/thankyou.html");
      });
    app.listen(process.env.PORT || 3000, function(req, res) {
      console.log("Server is running on ");
    });
