import express from "express";
import { categoryController } from "~/controllers/categoryController.js";

const Router = express.Router();

// API lấy tất cả category cho user
Router.route("/").get(categoryController.getAllForClient);

export const categoryRoute = Router;
