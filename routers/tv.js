const express=require('express');
const router=express.Router();
const { default: axios } = require('axios');
const catchAsync=require('../utilities/catchAsync');
const Tv=require("../Models/Tv");
const {isLoggedIn}=require('../middleware');
const {tvSchema}=require("../schema");
const AppError=require('../utilities/AppError');
router.get("/page/:id", async(req,res,next)=>{
    const {data}=await axios.get('https://api.tvmaze.com/shows',{headers:{Accept:'application/json'}});
    const {id}=req.params;
    if(parseInt(id)<0 || parseInt(id)>11)
    {
      next( new AppError("Page Not Found",404));
    }
    else
    {
    res.render('tvshows/search.ejs',{data,id});
    }
})
router.get("/:id",catchAsync(async (req,res,next)=>{
   const {id}=req.params;
   const tv=await Tv.findById(id).populate('reviews');
   res.render('tvshows/show.ejs',{tv});
}))
router.post("/",catchAsync(async (req,res,next)=>{
    const {search}=req.body;
    let movie=await axios.get(`http://api.tvmaze.com/search/shows?q=${search}`,{headers:{Accept:'application/json'}})
    if(movie.data.length)
    {
       const tv=movie.data[0].show;
       let {name,genres,image,summary,rating}=tv;
       let newTv=await Tv.findOne({name});
       if(!newTv){
                const k={name,image}
                const { error } = tvSchema.validate(k);
                if (error) {
                          
                         throw new AppError("Tv show not found", 404)
                           } 
                else{
                      
                      newTv=new Tv({name,original:image.medium,summary,genres,rating:rating.average});
                     await newTv.save();
                     }
                 }         
    res.redirect(`/tvshows/${newTv._id}`);
    }
  else{
    next(new AppError("Tv show not found",404))
     }
}))
module.exports=router;