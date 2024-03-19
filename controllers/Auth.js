const User = require("../models/User");
const OTP  = require("../models/OTP");
const otpGenerator = require("otp-generator")
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");

require("dotenv").config();
// send otp

exports.sendOTP = async (req,res) => {

    try {
        // fetch email from req body;
    const {email} = req.body;

    // check if user already exist

    const checkUserPresent = await User.findOne({email});

    // if user already exist

    if(checkUserPresent) {
        return res.status(400).json({
            success:false,
            message:"User already registered"
        })
    }

    // generate OTP

    var otp = otpGenerator.generate(6, {
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    })

    console.log("OTP generated " , otp);

    //check unique otp or not
    let result = await OTP.findOne({otp:otp})

    // if otp exist
    while(result){
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })
        result = await OTP.findOne({otp:otp})
    }

    const otpPayload = {email,otp};
    // create  entry in DB fot DB
    
    const otpBody = await OTP.create(otpPayload);

    console.log("OTP body", otpBody);
    

    return res.status(200).json({
        success:true,
        message:"OTP send Successfully",
        otp: `${otp}`
    })

    } catch (error) {
        console.log("error in otp sending", error);

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

// sign up 

exports.signup = async(req,res) => {


    //data fetch from re body
    //validate data
    //2 password match
    //check user already exist or not
    //find most recent otp for user
    //validate otp
    //password hashing
    // entry in db
    // return successfully res

    try {
        //data fetch from re body

        const {
            firstName,
            email,
            lastName,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
    //validate data

    if(!firstName || !lastName || !email || !password || !confirmPassword ||  !otp)
    {
        return res.status(403).json({
            success:false,
            message:"All fields are Required"
        })
    }
    //2 password match

    if(password !== confirmPassword) {
        return res.status(400).json({
            success:false,
            message:"Passpword and confirm password doess not match"
        })
    }
    //check user already exist or not

    const existingUser = await User.findOne({email});

    if(existingUser) {
        return res.status(400).json({
            success:false,
            message:"User is Already Registered"
        })
    }
        
    
    //find most recent otp for user
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);

    console.log("Email:", email);
    console.log("Recent OTP:", recentOtp);
    
    // validate otp
    if (recentOtp.length === 0) {
        console.log("OTP not found");
        return res.status(400).json({
            success: false,
            message: "OTP not found"
        });
    } else if (otp !== recentOtp[0]?.otp) {
        console.log("Invalid OTP");
        return res.status(400).json({
            success: false,
            message: "Invalid OTP"
        });
    }
    //password hashing
    const hashedPassword = await bcrypt.hash(password,10);
    // entry in db

    const profileDetails = await Profile.create({

        geneder:null,
        dateOfBirth:null,
        contactNumber:null
    })
    const user = await User.create({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        accountType,
        contactNumber,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })
    // return successfully res

    return res.status(200).json({
        success:true,
        message:"User is Registered Successfully",
        user
    })
    } catch (error) {
        console.log("error in signup ",error);

        return res.status(500).json({
            success:false,
            message:"User cannot be registered"
        })
    }
}


//login

exports.login = async (req,res) => {
    try {
        
        //get data from req body
        // validation data
        //user check exsit ot not
        //generate token, after match passowrd
        // creeate a cookie and send res

        //get data from req body

        const {email, password} = req.body;
    
        // validation data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:"all field are required"
            })
        }
        //user check exsit ot not

        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registerd"
            })
        }
        //generate token, after match passowrd

        
        if(await bcrypt.compare(password, user.password))
        {
            const payload = {
                email : user.email,
                id: user._id,
                accountType: user.accountType
    
            }
               const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1h"
               })
               user.token  = token;
               user.password = undefined;

               // create a cookie and send res

        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true

        }
        res.cookie("token",token, options).status(200).json({
            success:true,
            token,
            user,
            message:'logged in'
        })
        }

        else {
            return res.status(400).json({
                success:false,
                message:"Password is incorrect"
            })
        }
        
        



    } catch (error) {
        console.log("error in login", error)
        return res.status(400).json({
            success:false,
            message:"Login failure "
        })
    }
}


// cheange password

//exports.changePassword = async (req,res) => {
    // get data from req body
    // get oldpassword, new password , confirm
    // validation
    //update pass
    // send mail 
    // return res
//}


// Controller for Changing Password
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }