//jshint esversion:6
require('dotenv').config();     //env variable
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

// const bcrypt=require("bcrypt");  -->bcrypt
// const saltRounds=10;  //how many rounds to add salt  bcrypt
// const md5=require("md5");  md5 hash encrypt
// const encrypt=require("mongoose-encryption"); mongoose encrypt

const app=express();

// console.log(process.env.SECRET);   prints the secret const in env file

app.use(express.static("public"));    //can access public cssfile/images
app.set('view engine', 'ejs');   //allows use of ejs files
app.use(bodyParser.urlencoded({extended:true}));   //can extract content


//need all these app.uses for passport

//set session to have secret
app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false
}));

//initiialze passport and manage our session
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);     //to clear deprecation warning
const userSchema= new mongoose.Schema({
  email:String,
  password:String
});

//serialize cookies authenticate
//plugin to hash with passport
userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});   -->mongoose encrypt
//process.env.secret to access the files in our.env file
//use new userschema defined above to encrypt with mongoose plugin
//only encrypt certain fields, here we use password, if multiple add into password array with , seperating values
//encrypts when saved, decrypts when find called

const User=new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
//serialize users with passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//take password add key and get a cipher method
//hashing no longer needs encryption key, turns password into hash


//passport local mongoose salts and hashes


app.get("/",function(req,res){
  res.render("home");     //renders home.ejs page
})

app.get("/login",function(req,res){
  res.render("login");     //renders home.ejs page
})

app.get("/register",function(req,res){
  res.render("register");     //renders home.ejs page
})

app.get("/secrets",function(req,res){
  //only if authenticated and logged in then show
  if(req.isAuthenticated()){
      res.render("secrets");
  } else {
    res.redirect("/login")
  }
});

//deauthenticate user and log them out with passport
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
})

//cookies deleted when server restarts


//bcrypt
// app.post("/register",function(req,res){
//   bcrypt.hash(req.body.password,saltRounds,function(err,hash){
//     const newUser=new User({
//       email:req.body.username,
//       password:hash
//     });
//     newUser.save(function(err){
//       if (err) {
//           console.log(err);
//       } else {
//         res.render("secrets");
//       }
//     });
//   })
// })

  //use the names from the input types in ejs regsiter file
  //using user schema to build new user
  //this is allmd5 hashing
  // const newUser=new User({
  //   email:req.body.username,       //username from ejs file
  //   password:md5(req.body.password)    //also from there  this is the md5 hash
  // });
  // newUser.save(function(err){
  //   if (err) {
  //       console.log(err);
  //   } else {
  //     res.render("secrets");
      //save the user and then render the secrets page else log error
      //no app.get for secret route since dont want to render unless registered
//     }
//   });
// });



//bcrypt
// app.post("/login",function(req,res){
//   const username=req.body.username;
//   // const password=md5(req.body.password); md5 password
//   const password=req.body.password;
//   //look for username in database and if user found, check to see if password match
//   User.findOne({email:username},function(err,foundUser){
//     if (err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         bcrypt.compare(password,foundUser.password,function(err,result){
//           // if (foundUser.password===password) { for md5 hash
//             if(result===true){
//               res.render("secrets");
//             }
//               //if user found and password match then render page
//           })
//         }
//       }
//
//   });
// });



app.post("/register",function(req,res){
  //passport local mongoose
  User.register({username:req.body.username},req.body.password,function(err,user){
    if (err) {
        console.log(err);
        res.redirect("/register");
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      })
    }
  })
});


app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  })
 //passport function to login user
  req.login(user,function(err){
    if(err){
      console.log(err);
    } else {
      //passport authentication
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      });
    }
  })
});

app.listen(3000,function(){
  console.log("Server has started on port 3000");
});
