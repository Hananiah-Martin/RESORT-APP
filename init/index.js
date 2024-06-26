const mongoose=require("mongoose");
main().then((res)=>{
    console.log("connection succesfull");
}).
catch(err => console.log(err));
const Listing=require("../models/listing.js");
const initData=require("./data.js");
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
const initDb=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"661265af30086af79be7153a"}));
    await Listing.insertMany(initData.data);hh
    console.log("data was initialized");
}
initDb();
console.log(initData.data);
