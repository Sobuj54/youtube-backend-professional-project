import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist); //tested
router.route("/:playlistId").get(getPlaylistById).delete(deletePlaylist); //tested
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist); //tested
router.route("/remove/:playlistId/:videoId").delete(removeVideoFromPlaylist); //tested
router.route("/user/:userId").get(getUserPlaylists); //tested

export default router;
