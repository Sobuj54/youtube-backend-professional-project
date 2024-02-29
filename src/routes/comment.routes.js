import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").post(addComment).get(getVideoComments); //tested
router.route("/update/:commentId").patch(updateComment); //tested
router.route("/delete/:commentId").delete(deleteComment); //tested

export default router;
