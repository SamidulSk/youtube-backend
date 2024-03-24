import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// cloudinary.config({ 
//   cloud_name: 'drbb1ahny', 
//   api_key: '426714378482135', 
//   api_secret: 'RmeEv_fbj3lndAyCSAesIWAkLEU' 
// });
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        //   console.log("file uploaded succesfully on cloudinary",response)
        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Log or handle the error
        console.error("Error occurred during upload:", error);

        // Remove the locally saved temporary file as the upload operation failed
        fs.unlinkSync(localFilePath);

        return null;
    }
};

export { uploadOnCloudinary };
