const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const tvSchema=Schema({
    name:String,
    genres:[String],
    rating:Number,
    summary:String,
    original:String,
    reviews:[{type:Schema.Types.ObjectId,ref:'Review'}]
})
module.exports=mongoose.model("Tv",tvSchema);