const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const reviewSchema=Schema({
    rating:{
        type:Number,
        min:0.1,
        max:10
    },
    review:String,
    reviewAuthor:{type:Schema.Types.ObjectId,ref:'User'}
})
module.exports=mongoose.model('Review',reviewSchema);