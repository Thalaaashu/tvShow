module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.url=req.originalUrl;
        req.flash("error","Log in first");
        res.redirect('/login');
    }
    else
    {
        next();
    }
}