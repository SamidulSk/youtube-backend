import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs"
import e from "express";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })//database me save

      return { accessToken, refreshToken }


   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
   }
}

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

// *********login 

const loginUser = asyncHandler(async (req, res) => {
   //req.body->data
   //username or email
   //find the user
   //password check
   //access and refresh token
   //send cookie
   //succesfull
   const { email, username, password } = req.body
   if (!username && !email) { //agar dono nahi hai to error
      throw new ApiError(400, "username or email is required")
   }
   const user = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (!user) {
      throw new ApiError(404, "user does'nt exist")
   }
   const isPasswordValid = await user.isPasswordCorrect(password)//jo login kar ne aya hai uska diya huya data (user,password)
   if (!isPasswordValid) { // naki mongoose ka original save data (User)
      throw new ApiError(401, "password is not correct")
   }

   const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


   const options = {  //cookie ka object 
      httpOnly: true, //only modied throught server
      secure: true
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,//status code
            { //data
               user: loggedInUser, accessToken, refreshToken  //jab user accesstoken and refreshToken leke save karna chata ho to json me vaj do chilll user
            },
            "user logged in succesfully" // message
         )
      )


})
//***********logout */

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1 // this removes the field from document
         }
      },
      {
         new: true
      }
   )
   const options = {  //cookie ka object 
      httpOnly: true, //only modied throught server
      secure: true
   }
   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "user Logged out"))
})

//handle access and refrsh token
const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
   if (!incomingRefreshToken) {
      throw new ApiError(401, "unuthorized request")
   }
   try {
      const decodedTokenn = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
      const user = await User.findById(decodedTokenn?._id)

      if (!user) {
         throw new ApiError(401, "Invalid refresh token")
      }
      if (incomingRefreshToken != user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expire or used")
      }

      //generate
      const { accessToken, NewrefreshToken } = await generateAccessAndRefereshTokens(user._id)
      const options = {
         httpOnly: true,
         secure: true
      }
      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", NewrefreshToken, options)
         .json(
            new ApiResponse(
               200,
               { accessToken, refreshToken: NewrefreshToken },
               "AccesToken refreshed"
            )
         )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})
//
const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword } = req.body
   const user = User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
   }
   user.password = newPassword
   user.save({ validateBeforeSave: false })
   return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password Change successfully"))
})

//
const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(200, req.user, "current user fetched successfully")
})
//update text based data
const updateAccountDetails = asyncHandler(async (req, res) => {
   const { fullName, email } = req.body
   if (!fullName || !email) {
      throw new ApiError(400, "All fields are required")
   }
   User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {  //ak sath multiple update isiliye set operator
            fullName: fullName,
            email: email
         }
      },
      { new: true }
   ).select("-password")
   return res
      .status(200)
      .json(new ApiResponse(200, user, "Account Details updated successfully"))
})

//update file-avatar

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file missing")
   }
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   if (!avatar.url) {
      throw new ApiError(500, "Error while uploaded on avatar")
   }
   const user = await User.findByIdAndUpdate(
      req.user?._id, // auth middleware succesful tha, req object me user ka pura details add kardiya tha
      {
         $set: {
            avatar: avatar.url
         }
      },
      { new: true }
   ).select("-password")
   return res
      .status(200)
      .json(new ApiResponse(200, user, "avatar image update successfully"))
})
//update coverimage
const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path
   if (!coverImageLocalPath) {
      throw new ApiError(400, "cover image is file missing")
   }
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if (!coverImage.url) {
      throw new ApiError(500, "Error while uploaded on cover")
   }
   const user = await User.findByIdAndUpdate(
      req.user?._id, // auth middleware succesful tha, req object me user ka pura details add kardiya tha
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      { new: true }
   ).select("-password")
   return res
      .status(200)
      .json(new ApiResponse(200, user, "cover image update successfully"))
})
//user ka channel profile

const getUserChannelProfile = asyncHandler(async (req, res) => {
   const { username } = req.params // profile url 

   if (!username?.trim()) {
      throw new ApiError(400, "username is missing")
   }

   const channel = await User.aggregate([
      {
         $match: {  //only one
            username: username?.toLowerCase()
         }
      },
      {
         $lookup: {
            from: "subscriptions", //subscription model
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         $addFields: { // add new properties on user object
            subscribersCount: {
               $size: "$subscribers"
            },
            channelsSubscribedToCount: {
               $size: "$subscribedTo"
            },
            isSubscribed: {
               $cond: {//codition
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },//user subscribers me hai ki nahi
                  then: true,
                  else: false
               }
            }
         }
      },
      {//show only selected values to frontend
         $project: {
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1

         }
      }
   ])

   if (!channel?.length) {
      throw new ApiError(404, "channel does not exists")
   }

   return res
      .status(200)
      .json(
         new ApiResponse(200, channel[0], "User channel fetched successfully")
      )
})

// watchHistory
const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user._id)
         }
      },
      {
         $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     pipeline: [
                        {
                           $project: {
                              fullName: 1,
                              username: 1,
                              avatar: 1
                           }
                        }
                     ]
                  }
               },
               {
                  $addFields: {
                     owner: {
                        $first: "$owner"
                     }
                  }
               }
            ]
         }
      }
   ])

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
         )
      )
})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
}