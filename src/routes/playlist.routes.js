import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist); //tested
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist); //tested
router.route("/remove/:playlistId/:videoId").delete(removeVideoFromPlaylist); //tested

export default router;
