import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id.");
  }

  try {
    const removeLike = await Like.findOneAndUpdate(
      {
        video: videoId,
        likedBy: req.user._id,
      },
      {
        $unset: {
          video: true,
        },
      },
      {
        new: true,
      }
    );
    if (removeLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, removeLike, "video like removed."));
    }

    const likeVideo = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    if (!likeVideo) {
      throw new ApiError(500, "Video like failed.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "video liked successfully."));
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message));
  }
});

export { toggleVideoLike };
