import { Router } from "express";
import {
  getCurrentUserController,
  updateUserController,
  updatePasswordController,
} from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);

userRoutes.put("/update", updateUserController);

userRoutes.put("/update-password", updatePasswordController);

export default userRoutes;
