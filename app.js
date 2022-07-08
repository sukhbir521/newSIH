const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs=require("ejs");

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine','ejs');


mongoose.connect("mongodb+srv://sukhbir_13:abcd@cluster0.9p3kj.mongodb.net/arrays?retryWrites=true&w=majority", {
  useNewUrlParser: true

});



const schema={
  name:String,
  jan:{type:[Number],index:true,unique:false}
};
const Month=new mongoose.model("Month",schema);
var i=1;
const newarr=new Month({
  name:"sukhbirs",

});
for( i=1;i<=31;i++){
  newarr.jan.unshift(0);
}
newarr.save();











app.listen(3000, function(req, res) {
  console.log("Server is running");
});
