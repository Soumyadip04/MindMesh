import { Router } from "express";
import { uploadNote } from "../controllers/faculty.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// POST /api/faculty/upload-note
router.post("/upload-note", upload.single("pdf"), uploadNote);

export default router;
