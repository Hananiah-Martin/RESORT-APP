const User=require("../models/User.js");
module.exports.rednderSignUp=(req,res)=>{
    res.render("users/signup.ejs");
}
module.exports.signup=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        let newUser=new User({username,email});
        let registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listing");
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("signup");
    }
}
module.exports.renderLogin=(req,res)=>{
    res.render("users/login.ejs");
}
module.exports.login=async(req,res)=>{
    req.flash("success","Welcome to WanderLust!LoggedIn succesfully");
    let redirectUrl=res.locals.redirectUrl||"/listing";
    res.redirect(redirectUrl);
}
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully");
        res.redirect("/listing");
    })
}