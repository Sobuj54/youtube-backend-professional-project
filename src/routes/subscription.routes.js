import { Router } from "express";
import {
  getChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/channel/:channelId")
  .post(toggleSubscription)
  .get(getChannelSubscribers);

export default router;
