import { Router } from "express";
import {
  getAllUsersController,
  deleteUserController,
} from "../controllers/admin.controller.js";

const adminRoutes = Router();

adminRoutes.get("/users", getAllUsersController);

adminRoutes.delete("/users/:id", deleteUserController);

export default adminRoutes;
