import mongoose from "mongoose";
import dotenv from "dotenv";
import { Note } from "../src/models/notes.model.js";

dotenv.config();

const dummyNotes = [
  {
    title: "Operating System Module 5",
    fileUrl: "https://collection.cloudinary.com/dgmfyyp9u/d1b07e8ede6d4e5aab6486b7033f3fbd"
  },
  {
    title: "DBMS ER Diagrams",
    fileUrl: "https://collection.cloudinary.com/dgmfyyp9u/d1b07e8ede6d4e5aab6486b7033f3fbd"
  },
  {
    title: "Data Structures Cheat Sheet",
    fileUrl: "https://collection.cloudinary.com/dgmfyyp9u/d1b07e8ede6d4e5aab6486b7033f3fbd"
  }
];

const seedNotes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB connected...");

    await Note.deleteMany({});
    console.log("Existing notes deleted");

    await Note.insertMany(dummyNotes);
    console.log("Dummy notes seeded");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding notes:", error);
    process.exit(1);
  }
};

seedNotes();
