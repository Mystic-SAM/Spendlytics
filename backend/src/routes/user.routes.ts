import { Router } from "express";
import {
  getCurrentUserController,
  updateUserController,
} from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.get("/current-user", getCurrentUserController);

userRoutes.put("/update", updateUserController);

export default userRoutes;
