import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTweet); //tested
router.route("/update/:tweetId").patch(updateTweet); //tested
router.route("/delete/:tweetId").delete(deleteTweet); //tested
router.route("/user/:userId").get(getUserTweets); //tested

export default router;
