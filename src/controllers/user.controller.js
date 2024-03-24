import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"
//import jwt from "jsonwebtoken"
//import mongoose from "mongoose";


// const generateAccessAndRefereshTokens = async (userId) => {
//    try {
//       const user = await User.findById(userId)
//       const accessToken = user.generateAccessToken()
//       const refreshToken = user.generateRefreshToken()

//       user.refreshToken = refreshToken
//       await user.save({ validateBeforeSave: false })

//       return { accessToken, refreshToken }


//    } catch (error) {
//       throw new ApiError(500, "Something went wrong while generating referesh and access token")
//    }
// }

const registerUser = asyncHandler(async (req, res) => {
   // get user details from frontend
   // validation - not empty
   // check if user already exists: username, email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res


   const { fullName, email, username, password } = req.body  //only text file availble
   //console.log("email: ", email);
   // console.log(req.body);

   if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (existedUser) {
      const avatarLocalPath = req.files?.avatar[0]?.path;
      let coverImageLocalPath;
      if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
         coverImageLocalPath = req.files.coverImage[0].path
      }
      fs.unlinkSync(avatarLocalPath)
      fs.unlinkSync(coverImageLocalPath)
      throw new ApiError(409, "User with email or username already exists")
   }
   // console.log(req.files); //-> this response by multer

   const avatarLocalPath = req.files?.avatar[0]?.path; //?-> optionaly
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
   }
   // console.log(avatarLocalPath)
   // if (avatarLocalPath) {
   //    console.log("Avatar upload on multer sucesfully")
   //    console.log(avatarLocalPath);
   // }
   // if (coverImageLocalPath) {
   //    console.log("cover image multer me agaya")
   // }

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   // console.log("cloudnary return this",avatar); 

   if (!avatar) {
      throw new ApiError(500, "Avatar file is not uploaded on cloudinary")
   }


   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
   )

})
export { registerUser }