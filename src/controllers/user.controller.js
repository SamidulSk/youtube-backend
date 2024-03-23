import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
   // 1. get user details from from fronend
   const { fullName, email, username, password } = req.body
   console.log("email:", email);
   console.log("pass:", password);
   console.log("name:", fullName);
   // 2. validation->  empty to nahi hai?

   // if(fullName===""){
   //   throw new ApiError(400,"fullname is required")
   // }
   if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, " all field is required")
   }
   // 3. check if user already exist username,email

   const exitedUser = User.findOne({
      $or: [{ username }, { email }]
   })
   if (exitedUser) {
      throw new ApiError(409, "user with email or username already exists")
   }
   // 4. check for images,avatar*
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPaht = req.files?.coverImage[0]?.path;
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }
   // 5. upload them to cloudinary- avatar
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPaht)
   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }
   // 6. create user object in db
   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })
   //remove password and refresh token field from response
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   //check user creation
   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   //return response
   return res.status(201).json(
      new ApiResponse(200,createdUser,"User Registered Successfully")
   )

})

export { registerUser }