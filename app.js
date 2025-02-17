if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}
console.log(process.env.CLOUD_NAME);
const express=require("express");
let port=8080;
const app=express();
const mongoose=require("mongoose");
const path=require("path");
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,"public")));
const ExpressError=require("./utils/ExpressError.js");
const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/User.js");
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/User.js");
const Listing=require("./models/listing.js");
const Razorpay = require('razorpay');
const store=MongoStore.create({
    mongoUrl:"mongodb+srv://hananiahhoney5:55VikeotfqDYmKT2@cluster0.5h25d9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("Error in mongo session store",err);
})
const sessionOptions={
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(express.json());
const map_api=process.env.MAP_API;

main().then(()=>{
    console.log("connected to database successfully");
}).
catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb+srv://hananiahhoney5:55VikeotfqDYmKT2@cluster0.5h25d9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
}

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
app.post('/create-order', async (req, res) => {
    try {
      const options = {
        amount: req.body.amount * 100, // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: 'order_' + Date.now(),
        payment_capture: 1 // auto capture payment
      };
      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto
      .createHmac('sha256', 'YOUR_RAZORPAY_KEY_SECRET')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    if (generated_signature === razorpay_signature) {
      res.json({ status: 'success', message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ status: 'failure', message: 'Payment verification failed' });
    }
  });
app.post("/landmark",async (req,res)=>{
    let {search}=req.body;
    let allListings=await Listing.find({landmark:search});
    console.log(allListings.length);
    if(allListings!=null){
        res.render("landmark.ejs",{allListings});
    }
})
app.get("/maps/:name",(req,res)=>{
    res.render("maps.ejs",{map_api});
})
app.get("/listing/:id/allReviews",async (req,res)=>{
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
    res.render("allreviews.ejs",{listing,average});
})
app.get("/listing/:id/rating",async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        },
}).populate("owner");
    res.render("ratingtwo.ejs",{listing});
});
app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let {statusCode=404,message="Page Not Found"}=err;
    res.render("errorPage.ejs",{message})
})
app.listen(port,()=>{
    console.log("listening");
})