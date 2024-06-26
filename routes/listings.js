const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema}=require("../schema.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage })
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message.join(","));
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}
const {isLoggedIn,isOwner}=require("../middleware.js");
const listingController=require("../controllers/listing.js");
router.get("/",wrapAsync(listingController.index));
router.get("/new",isLoggedIn,listingController.renderNewForm);
router.get("/:id",wrapAsync(listingController.showListing));
// router.post("/",upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// })
router.post("/",
upload.single("listing[image]"),
wrapAsync
(listingController.createListing)
);
router.get("/:id/edit",isLoggedIn,upload.single("listing[image]"),isOwner,listingController.renderEditForm);
router.put("/:id",isOwner,upload.single("image"),wrapAsync(listingController.updateListing));
router.delete("/:id",isLoggedIn,isOwner,listingController.deleteListing);
module.exports=router;