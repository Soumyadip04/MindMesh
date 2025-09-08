import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError}from "../utils/ApiError.js"
import {Faculty}from "../models/faculty.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Note } from "../models/notes.model.js";

const generateAccessAndRefreshToken = async(facultyId)=>{
    try {
      const faculty =  await Faculty.findById(facultyId)
      const accessToken = faculty.generateAccessToken()
      const refreshToken = faculty.generateRefreshToken()
      faculty.refreshToken = refreshToken
      await faculty.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}
const registerFaculty = asyncHandler( async(req,res)=>{
    // get Faculty details from frontend
    // validation - not empty
    // check if Faculty already exists : TeacherID, email
    // create Faculty object - create entry in db
    // remove password and refresh token field from response
    // check for successful Faculty creation
    // return response



    const {Name, email,password,TeacherID } = req.body
    // console.log("email: ", email);

    if(
        [Name, email, TeacherID, password].some((field)=>
    field?.trim() === "")
) {
        throw new ApiError(400, "All fields are required")
    }
   const existedFaculty = await Faculty.findOne({
        $or: [{TeacherID},{email}]
    })

    if(existedFaculty)
    {
        throw new ApiError(409, "Faculty with email or TeacherID already exists")
    }
    

  const faculty = await Faculty.create({
    Name,
    email,
    password,
    TeacherID: TeacherID.toLowerCase()    
   })

   const createdFaculty = await Faculty.findById(faculty._id).select(
        "-password -refreshToken" //this line means we don't need this fields when giving response to the Faculty
   )

   if(!createdFaculty){
        throw new ApiError(500,"Something went wrong while registering the Faculty")
   }

   return res.status(201).json(
      new ApiResponse(200, createdFaculty, "Faculty registered Successfully")
   )
})


const loginFaculty = asyncHandler(async(req,res)=>{
    const {email,TeacherID,password} = req.body
    if(!TeacherID && !email)
    {
        throw new ApiError(400, "TeacherID or email is required")
    }
    const faculty =  await Faculty.findOne({
            $or: [{studentID},{email}]
        })
    
        if(!faculty){
            throw new ApiError(404, "faculty does not exists")
        }
    
        const isPasswordValid = await faculty.isPasswordCorrect(password)
    
        if(!isPasswordValid){
            throw new ApiError(401, "Password does not exists")
        }
    
       const {accessToken,refreshToken} = await generateAccessAndRefreshToken(faculty._id)
    
       const loggedInfaculty = await faculty.findById(faculty._id).select("-password -refreshToken")
    
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
                    faculty: loggedInfaculty, accessToken,refreshToken
                },
                "faculty logged In Successfully"
            )
       )
})

const logoutFaculty = asyncHandler(async(req,res)=>{
   await Faculty.findByIdAndUpdate(
        req.faculty._id,
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
   .json(new ApiResponse(200, {}, "faculty faculty logged Out"))
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
    
        const faculty = await Faculty.findById(decodedToken?._id)
        if (!faculty)
        {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== faculty?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(faculty._id)
    
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

    const faculty = await Faculty.findById(req.faculty?._id)
   const isPasswordCorrect =  await faculty.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect)
   {
     throw new ApiError(400, "Invalid old password")
   }

   faculty.password = newPassword
   await faculty.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const { title } = req.body;
  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  // Upload PDF to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

  // Save note in MongoDB
  const note = await Note.create({
    title,
    fileUrl: cloudinaryResponse.secure_url,
    uploadedBy: req.user?._id, // optional, if faculty auth exists
  });

  return res
    .status(201)
    .json(new ApiResponse(200, note, "Note uploaded successfully"));
});

export {
    registerFaculty,
    loginFaculty,
    logoutFaculty,
    refreshAccessToken,
    changeCurrentPassword,
    uploadNote
}