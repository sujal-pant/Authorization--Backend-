import express  from "express"
import {checkAuth,resetPassword,forgotPassword,verifyEmail, login, logout, signup } from "../Controllers/auth.controller.js"
import{verifyToken} from "../Middleware/verifyToken.js"
const router = express.Router()

router.get("/check-auth",verifyToken, checkAuth)
router.post("/signup", signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/verify", verifyEmail)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword);


export default router
