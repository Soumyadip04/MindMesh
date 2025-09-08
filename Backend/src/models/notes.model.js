import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
  title: { type: String, required: true },           // Title of the note
  description: { type: String },                     // Short description
  fileUrl: { type: String, required: true },         // Cloudinary/Drive link
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }, // Faculty reference
  department: { type: String },                      // Optional: filter notes by dept
  subject: { type: String },                         // Optional: subject name
  createdAt: { type: Date, default: Date.now }       // Auto timestamp
});

export const Note = mongoose.model("Note", notesSchema);
