const RatingAndReview = require("../models/RatingAndReview");

const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating

exports.createRating = async(req,res) => {
    try {
        

        // get user id
        // fetch data from user body
        //check id user is enrolled or not
        // check if user already review the course
        // create rating and review
        //update the course with the rating and review
        // return response

        // get user id
        const userId = req.user.id;

        // fetch data from user body

        const {rating, review, courseId} = req.body;
        //check id user is enrolled or not

        const courseDetails = await Course.findOne({
            _id:courseId,
            studentsEnrolled : {$elemMatch: {$eq : userId}}
        })

        if(!courseDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Student is not Enrolled in the course"
            })
        }
        // check if user already review the course

        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId

        })

        if(alreadyReviewed)
        {
            return res.status(403).json({
                success:false,
                message:"Rating are already created"
            })
        }
        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,review,
            course: courseId,
            user:userId
        });
        //update the course with the rating and review
       const updatedCourseDetails =     await Course.findByIdAndUpdate( {_id: courseId}, {
            $push: {
                ratingAndReviews: ratingReview._id
            },
            
        }, {
            new : true
        })

        console.log(updatedCourseDetails)
        // return response

        return res.status(200).json({
            success:true,
            message:"Rating and Review SuccessFully",
            ratingReview
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get average raing

exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// get all rating and review

exports.getAllRating = async (req, res) => {
    try {
        const allReview = await RatingAndReview.find({}).sort({rating: "desc"}).populate({
            path:"user", 
            select : "firstName lastName email image"
        }).populate({
            path : "course",
            select: "courseName"
        }).exec();

        return res.status(200).json({
            success:true,
            message: "All review fetched successfully",
            data: allReview
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
} 