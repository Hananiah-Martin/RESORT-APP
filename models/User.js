const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMonogoose=require('passport-local-mongoose');
const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    }
})
userSchema.plugin(passportLocalMonogoose);
module.exports=mongoose.model("User",userSchema);