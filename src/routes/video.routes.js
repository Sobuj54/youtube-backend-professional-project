import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); //Apply verifyJWT middleware to all the routes in this file

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

export default router;
