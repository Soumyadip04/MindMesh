import {Router} from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, downloadNotes } from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { verifyJWTUser } from "../middlewares/Auth.middleware.js";
const router = Router()

router.route("/register").post(
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWTUser, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWTUser, changeCurrentPassword)
router.route("/current-user").get(verifyJWTUser,getCurrentUser)
router.route("/downloadnotes").get(verifyJWTUser,downloadNotes)
export default router