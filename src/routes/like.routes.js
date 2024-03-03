import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/video/:videoId").post(toggleVideoLike);
router.route("/toggle/comment/:commentId").post(toggleCommentLike); //tested
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike);

export default router;
