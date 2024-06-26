const Listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError=require("./utils/ExpressError.js");
const {reviewSchema}=require("./schema.js");
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create new Listing");
        return res.redirect("/login");
    }
    next();
}
const saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
const isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(listing.owner._id.equals(res.locals.currUser._id)==false){
        req.flash("error","You need permission to edit");
        return res.redirect("/listing");
    }
    next();
}
const isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    console.log(review);
    if(review.author._id.equals(res.locals.currUser._id)==false){
        req.flash("error","You are not the author of the review");
        return res.redirect("/listing");
    }
    next();
}
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message.join(","));
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}
module.exports={isLoggedIn,saveRedirectUrl,isOwner,isReviewAuthor,validateReview};