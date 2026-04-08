import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  sendOtpController,
} from "../controllers/auth.controller.js";
const authRoutes = Router();

authRoutes.post("/send-otp", sendOtpController);
authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logoutController);
authRoutes.post("/refresh-token", refreshTokenController);

export default authRoutes;