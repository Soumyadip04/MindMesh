import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError}from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Note } from "../models/notes.model.js";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
      const user =  await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler( async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists : studentID, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for successful user creation
    // return response



    const {Name, email,password,studentID } = req.body
    // console.log("email: ", email);

    if(
        [Name, email, studentID, password].some((field)=>
    field?.trim() === "")
) {
        throw new ApiError(400, "All fields are required")
    }
   const existedUser = await User.findOne({
        $or: [{studentID},{email}]
    })

    if(existedUser)
    {
        throw new ApiError(409, "User with email or studentID already exists")
    }
    

  const user = await User.create({
    Name,
    email,
    password,
    studentID: studentID.toLowerCase()    
   })

   const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //this line means we don't need this fields when giving response to the user
   )

   if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
   )
})

const loginUser = asyncHandler( async (req,res)=>{
    // req body -> data
    // studentID or email
    //find the user
    //password check
    //access and refresh token-> access token is short lived refresh token is long lived
    //send cookie

    const {email, studentID, password} = req.body

    if(!studentID && !email)
    {
        throw new ApiError(400, "studentID or email is required")
    }

  const user =  await User.findOne({
        $or: [{studentID},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password does not exists")
    }

   const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   // this make the cookie modifiable only by the server , the client side can only see the cookie but cannot modify it.
   const options = {
        httpOnly : true,
        secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken",refreshToken, options)
   .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken
            },
            "User logged In Successfully"
        )
   )
})

const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken : 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken)
    {
        throw new ApiError(401, "unauthorised request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if (!user)
        {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshTokenefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
   const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect)
   {
     throw new ApiError(400, "Invalid old password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

// Get all notes (download notes list)
const downloadNotes = asyncHandler(async (req, res) => {
  try {
    const notes = await Note.find({}); // get all notes
    if (!notes || notes.length === 0) {
      throw new ApiError(404, "No notes found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Error fetching notes");
  }
});




//project completed
//exporting functions as an object
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    downloadNotes,
} 


