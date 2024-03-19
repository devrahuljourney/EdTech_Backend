const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type:String
    },
    dataOfBirth :{
        type:String
    },
    About:{
       type:String,
       trim:true,
    },
    contactNumber : {
        type:Number,
        trim:true
    }
})

module.exports = mongoose.model("Profile", profileSchema);