import express from "express";
import { brandController } from "~/controllers/brandController.js";

const Router = express.Router();

// API lấy tất cả các brands cho client
Router.route("/").get(brandController.getAllForClient);

export const brandRoute = Router;
