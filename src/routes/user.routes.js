import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  registerUser
); //tested

router.route("/login").post(loginUser); //tested

// secured routes
router.route("/logout").post(verifyJWT, logoutUser); //tested

router.route("/refresh_token").post(refreshAccessToken);

// change password endpoint
router.route("/change-password").patch(verifyJWT, changeCurrentPassword); //tested

router.route("/current-user").get(verifyJWT, getCurrentUser); //tested

router.route("/update-name-email").patch(verifyJWT, updateAccountDetails); //tested

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar); //tested

router
  .route("/update-coverImg")
  .patch(verifyJWT, upload.single("coverImg"), updateUserCoverImg); //tested

export default router;
