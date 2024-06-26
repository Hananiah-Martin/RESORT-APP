const Listing=require("../models/listing");
const review = require("../models/review");
module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("index.ejs",{allListings});
};
module.exports.renderNewForm=(req,res)=>{
    res.render("new.ejs");
};
module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        },
}).populate("owner");
    let sum=0;
    for(let i=0;i<listing.reviews.length;i++){
        let num=parseInt(listing.reviews[i].rating);
        sum=sum+num;
    }
    let average=Math.floor(sum/listing.reviews.length);
    res.render("show.ejs",{listing,average});
}
module.exports.createListing=async (req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New listing created");
    res.redirect("/listing");
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("edit.ejs",{listing});
}
module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    const {title,description,price,location,country,landmark}=req.body;
    console.log(landmark);
    let listing=await Listing.findByIdAndUpdate(id,{title:title,description:description,price:price,location:location,country:country,landmark:landmark});
    if(typeof req.file!="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Listing edited succesfully");
    res.redirect("/listing")
}
module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted sucessfully")
    res.redirect("/listing");
}