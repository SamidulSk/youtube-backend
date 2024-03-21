// local system to cloudinary service
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudnary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null
        //upload
     const response=  await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file have been uploaded succesfully
        console.log("File is uploaded on cloudinary",  response.url);
        return response
      
    }
    catch(error){
         fs.unlink(localFilePath) // remove the localy saved temp file 
         return null
    }
}

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });