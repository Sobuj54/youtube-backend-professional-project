import { Router } from "express";
import {
  getChannelSubscribers,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/channel/:channelId")
  .post(toggleSubscription)
  .get(getChannelSubscribers);

router.route("/channel/subscribed/:subscriberId").get(getSubscribedChannels);

export default router;
