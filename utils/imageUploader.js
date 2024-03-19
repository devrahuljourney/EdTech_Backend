const cloudinary = require('cloudinary').v2

// exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
//     try {
//         const options = { folder };
//         console.log("File details:", file);
//         console.log("Cloudinary options:", options)
//         if (height) {
//             options.height = height;
//         }

//         if (quality) {
//             options.quality = quality;
//         }
        
//         options.resource_type = "auto";

//         const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, options);
//         return uploadResult;
//     } catch (error) {
//         console.error("Error uploading image to Cloudinary:", error);
//         throw new Error("Failed to upload image to Cloudinary");
//     }
// };



exports.uploadImageToCloudinary  = async (file, folder, height, quality) => {
    const options = {folder};
    if(height) {
        options.height = height;
    }
    if(quality) {
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}

// exports.uploadVideoToCloudinary = async (file, folder) => {
//     const options = { folder, resource_type: "video" };

//     try {
//         const result = await cloudinary.uploader.upload(file.tempFilePath, options);
//         return result;
//     } catch (error) {
//         console.error("Error uploading video to Cloudinary:", error);
//         throw new Error("Failed to upload video to Cloudinary");
//     }
// };
