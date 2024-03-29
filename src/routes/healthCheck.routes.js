import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import healthCheck from "../controllers/healthCheck.controller.js";

const router = Router();

router.route("/").get(verifyJWT, healthCheck);

export default router;
