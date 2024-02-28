import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTweet); //tested
router.route("/update/:tweetId").patch(updateTweet);

export default router;
