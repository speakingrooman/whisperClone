//jshint esversion:6
require('dotenv').config();     //env variable
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app=express();

console.log(process.env.SECRET);

app.use(express.static("public"));    //can access public cssfile/images
app.set('view engine', 'ejs');   //allows use of ejs files
app.use(bodyParser.urlencoded({extended:true}));   //can extract content

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});

const userSchema= new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
//process.env.secret to access the files in our.env file
//use new userschema defined above to encrypt with mongoose plugin
//only encrypt certain fields, here we use password, if multiple add into password array with , seperating values
//encrypts when saved, decrypts when find called

const User=new mongoose.model("User",userSchema);




app.get("/",function(req,res){
  res.render("home");     //renders home.ejs page
})

app.get("/login",function(req,res){
  res.render("login");     //renders home.ejs page
})

app.get("/register",function(req,res){
  res.render("register");     //renders home.ejs page
})

app.post("/register",function(req,res){
  //use the names from the input types in ejs regsiter file
  //using user schema to build new user
  const newUser=new User({
    email:req.body.username,       //username from ejs file
    password:req.body.password    //also from there
  });
  newUser.save(function(err){
    if (err) {
        console.log(err);
    } else {
      res.render("secrets");
      //save the user and then render the secrets page else log error
      //no app.get for secret route since dont want to render unless registered
    }
  });
});

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  //look for username in database and if user found, check to see if password match
  User.findOne({email:username},function(err,foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
          if (foundUser.password===password) {
              res.render("secrets");
              //if user found and password match then render page
          }
      }
    }
  });
});


app.listen(3000,function(){
  console.log("Server has started on port 3000");
});
