const express=require('express');
const router=express.Router();
const catchAsync=require('../utilities/catchAsync');
const Tv=require("../Models/Tv");
const {isLoggedIn}=require('../middleware');
const AppError=require('../utilities/AppError');
const Review=require('../Models/Review');
const {reviewSchema}=require('../schema');
function reviewValidation(req,res,next){
    const {error}=reviewSchema.validate(req.body);
    if(error)
    {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 404)
    }
    else
    {
        next();
    }
}
router.get("/:id/reviews",isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const tv=await Tv.findById(id).populate({
        path:'reviews',
        populate:{
          path:'reviewAuthor'
        }
    });
    res.render('reviews/review.ejs',{tv});
})
router.post('/:id/reviews',reviewValidation,catchAsync(async (req,res)=>{
    const {id}=req.params;
    console.log(req.user);
   const review=new Review(req.body);
   review.reviewAuthor=req.user._id;
   const tv=await Tv.findById(id);
   tv.reviews.push(review);
   await tv.save();
   await review.save();
   req.flash("success","Your review has been succesfully posted");
   res.redirect(`/tvshows/${id}/reviews`);
}))
router.delete('/:id/:reviewid',catchAsync(async (req,res)=>{
    const {id,reviewid}=req.params;
    const tv=await Tv.findById(id);
    await Tv.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success","Your review has been successfully deleted");
    res.redirect(`/tvshows/${id}/reviews`);
}))
module.exports=router;