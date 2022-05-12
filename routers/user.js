const express=require('express');
const router=express.Router();
const passport=require('passport');
const catchAsync=require('../utilities/catchAsync');
const User=require('../Models/User');
const {isLoggedIn}=require('../middleware');
router.get("/register",(req,res)=>{
    res.render("users/register.ejs");
})
router.post('/register',catchAsync(async (req,res,next)=>{
    try{
    const {email,username,password}=req.body;
    const user=new User({email,username});
    const registeredUser=await User.register(user,password);
    req.login(registeredUser,(err)=>{
        if(err)
        {
            return next(err);
        }
        req.flash("success","You have been successfully registered");
        res.redirect('/tvshows/page/0');
    });
}catch(err){
   req.flash("error",err.message)
   res.redirect('/register');
}
}))
router.get('/login',(req,res)=>{
    res.render('users/login.ejs');
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
  const url=req.session.url||"/tvshows/page/0";
  delete req.session.url;
  req.flash('success',"You are successfully logged in")
  res.redirect(url);
})
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash("success","You are logged out");
    res.redirect("/tvshows/page/0");
})
module.exports=router;