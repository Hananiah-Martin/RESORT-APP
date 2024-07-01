const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
module.exports.createReview=async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${listing._id}/allReviews`)
}
module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review,reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${id}/allReviews`);
}