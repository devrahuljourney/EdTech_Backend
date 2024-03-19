const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required:true,
    },
    otp : {
        type: String,
        required: true,
    }
    ,
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 5 * 60
    }
})

 // a function -> to send emails

 async function sendVerificationEmail(email,otp) {
    try {
        const mailResponse = await mailSender(email,"Verification email", otp);
        console.log("Email send successfully" , mailResponse);
    } catch (error) {
        console.log("otp sending error",error);
        throw error
    }
 }

otpSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);