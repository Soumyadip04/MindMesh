import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload any file (PDF in this case) to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw", // "raw" is required for PDFs/docs
      folder: "notes",      // optional: all files go in "notes" folder
    });

    // remove file from local storage after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // cleanup local file if error occurs
    fs.unlinkSync(localFilePath);
    throw error;
  }
};

export { uploadOnCloudinary };
