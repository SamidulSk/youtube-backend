import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"

//upload
const uploadVideo=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    if((email || password)===""){
        throw new ApiError(400,"provide a valid email or password")
    }
})