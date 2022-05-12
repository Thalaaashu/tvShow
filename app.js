const { default: axios } = require('axios');
const express=require('express');
const path=require('path');
const User=require('./Models/User');
const Joi=require('joi');
const helmet = require("helmet");
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const Tv=require("./Models/Tv");
const Review=require('./Models/Review');
const passport = require('passport');
const userrouter=require('./routers/user');
const LocalStrategy = require('passport-local');
const app=express();
const tvrouter=require('./routers/tv');
const flash=require('connect-flash');
const reviewrouter=require('./routers/review');
const {reviewSchema}=require('./schema');
const {tvSchema}=require("./schema");
const {isLoggedIn}=require('./middleware');
const catchAsync=require('./utilities/catchAsync');
const session=require('express-session');
const AppError=require('./utilities/AppError');
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs',ejsMate)
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
const MongoStore=require('connect-mongo');
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/tvshows';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(()=>{
    console.log("database connected");
})
.catch(()=>{
    console.log("connection failed");
})
const store = MongoStore.create({
    mongoUrl:dbUrl
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const secret=process.env.SECRET||"this is my secret";
const sessionConfig={
    store,name:"session",
    secret,
    resave:false,
    saveuninitialized:false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.user=req.user;
    next();
})
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
app.use(mongoSanitize());

app.get('/',async(req,res,next)=>{
    const {data}=await axios.get('https://api.tvmaze.com/shows',{headers:{Accept:'application/json'}});
    res.render('welcome.ejs',{data});
})
app.use('/tvshows',tvrouter);
app.use('/tvshows',reviewrouter);
app.use('/',userrouter);
app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)
       err.message="Something went Wrong"
    res.render('error.ejs',{err});
})
const port=process.env.PORT||3000;
app.listen(port,()=>{
    console.log(`${port} port connected`);
})