import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllLikedVideos);
router.route("/toggle/video/:videoId").post(toggleVideoLike); //tested
router.route("/toggle/comment/:commentId").post(toggleCommentLike); //tested
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike); //tested

export default router;
