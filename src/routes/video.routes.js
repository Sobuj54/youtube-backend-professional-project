import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); //Apply verifyJWT middleware to all the routes in this file

router.route("/").get(getAllVideos);

router.route("/publish").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
); //tested

router.route("/:videoId").get(getVideoById); //tested

router.route("/update/:videoId").patch(updateVideo); //tested

router.route("/toggle-status/:videoId").patch(togglePublishStatus); //tested

router.route("/delete/:videoId").delete(deleteVideo); //tested

export default router;
