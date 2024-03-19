// const Category = require("../models/Category.js");
// // const Tag = require("../models/tags");
// // //for tag creation
// // exports.createTag = async (req,res) => {
// //     try {



        

// //         const  {name,description} = req.body;

// //         // validateion
// //         if(!name || !description)
// //         {
// //             return res.status(400).json({
// //                 success:false,
// //                 message:"All field are required"
// //             })
// //         }
// //         // create entry in db

// //         const tagDetails = Tag.create({
// //             name:name,
// //             description:description
// //         })
// //         console.log("tag Details",tagDetails);

// //         return res.status(200).json({
// //             success:true,
// //             message:"Tag Created SuccessFully"
// //         })

// //     } catch (error) {
// //         return res.status(400).json({
// //             success:false,
// //             message:error.message
// //         })
// //     }
// // }

// // // get all tag

// // exports.showAlltags = async (req,res) => {
// //     try {
// //         const allTags = await Tag.find({}, {name:true, description:true} )
// //         return res.status(200).json({
// //             success:true,
// //             message:"All Tag return successfully",
// //             allTags
// //         })
// //     } catch (error) {
// //         return res.status(400).json({
// //             success:false,
// //             message:error.message
// //         })
// //     }
// // }

// // const { Mongoose } = require("mongoose");
// // const Category = require("../models/Category");
// // function getRandomInt(max) {
// //     return Math.floor(Math.random() * max)
// //   }

// exports.createCategory = async (req, res) => {
// 	try {
// 		const { name, description } = req.body;
// 		if (!name) {
// 			return res
// 				.status(400)
// 				.json({ success: false, message: "All fields are required" });
// 		}
// 		const categoryDetails = await Category.create({
// 			name: name,
// 			description: description,
// 		});
// 		console.log(categoryDetails);
// 		return res.status(200).json({
// 			success: true,
// 			message: "Category Created Successfully",
// 		});
// 	} catch (error) {
// 		return res.status(500).json({
// 			success: true,
// 			message: error.message,
// 		});
// 	}
// };

// exports.showAllCategories = async (req, res) => {
// 	try {
//         console.log("INSIDE SHOW ALL CATEGORIES");
// 		const allCategorys = await Category.find({});
		
// 		console.log("cateogry list", allCategorys )
// 		res.status(200).json({
// 			success: true,
// 			data: allCategorys,
// 		});
		
// 	} catch (error) {
// 		return res.status(500).json({
// 			success: false,
// 			message: error.message,
// 		});
// 	}
// };

// // category page details 

// exports.categoryPageDetails = async (req,res) => {
// 	try {
// 		// get category id
// 		// get courses for specified category id
// 		// validation
// 		// get  courses for different courses
// 		// get top selling courses
// 		// return response

// 		// get category id

// 		const {CategoryId} = req.body;

// 		// get courses for specified category id
// 		const selectedCategory = await Category.findById(CategoryId).populate("courses").exec();
// 		// validation
// 		if(!selectedCategory)
// 		{
// 			return res.status(404).json({
// 				success:false,
// 				message:"Data not found"
// 			})
// 		}
// 		// get  courses for different courses
// 		const differentCategories = await Category.findById({
// 			_id: {$ne : CategoryId}
// 		}).populate("courses").exec();
// 		// get top selling courses
// 		// return response
// 		return res.status(200).json({
// 			success:true,
// 			data:{
// 				selectedCategory,
// 				differentCategories
// 			}
// 		})
// 	} catch (error) {
// 		console.log(error);
// 		return res.status(500).json({
// 			success:false,
// 			message: error.message
// 		})
// 	}
// }


const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
        console.log("INSIDE SHOW ALL CATEGORIES");
		const allCategorys = await Category.find({});
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
           match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
  
      console.log("SELECTED COURSE", selectedCategory)
      // Handle the case when the category is not found
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      // Handle the case when there are no courses
      if (selectedCategory.courses.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      })
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
           match: { status: "Published" },
        })
        .exec()
        console.log("Different COURSE", differentCategory)
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
           match: { status: "Published" },
          populate: {
            path: "instructor",
        },
        })
        .exec()
      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10)
       console.log("mostSellingCourses COURSE", mostSellingCourses)
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }