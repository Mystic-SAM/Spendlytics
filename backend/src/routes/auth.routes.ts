import { Router } from "express";
import { registerController } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", registerController);

export default authRoutes;