//requiring mongoose
const mongoose=require("mongoose");
//creating Schema
const Schema=mongoose.Schema;
const Review=require("../models/review.js");
const User=require("../models/User.js");
const { required } = require("joi");
//creating our own schema with our own properties
const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{
        url:String,
        filename:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    landmark:{
        type:String,
        required:true,
    }
});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});
//it's like a variable to store a model with our properties
const Listing=mongoose.model("Listing",listingSchema);
//exporting this variable to use in app.js
module.exports=Listing;