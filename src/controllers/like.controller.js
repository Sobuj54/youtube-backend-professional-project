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
        $or: [{ comment: { $exists: true } }, { tweet: { $exists: true } }],
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

    const deleteDoc = await Like.findOneAndDelete({
      video: videoId,
      likedBy: req.user._id,
      $and: [{ comment: { $exists: false } }, { tweet: { $exists: false } }],
    });
    if (deleteDoc) {
      return res
        .status(200)
        .json(new ApiResponse(200, deleteDoc, "Toggled video likes."));
    }

    const findDoc = await Like.findOneAndUpdate(
      {
        likedBy: req.user._id,
        $or: [{ comment: { $exists: true } }, { tweet: { $exists: true } }],
        video: { $exists: false },
      },
      {
        $set: {
          video: videoId,
        },
      },
      {
        new: true,
      }
    );
    if (findDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            findDoc,
            "Video like toggled by setting video field successfully."
          )
        );
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

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Provide valid comment id.");
  }

  try {
    const removeComment = await Like.findOneAndUpdate(
      {
        comment: commentId,
        likedBy: req.user._id,
        $or: [{ tweet: { $exists: true } }, { video: { $exists: true } }],
      },
      {
        $unset: {
          comment: true,
        },
      },
      {
        new: true,
      }
    );
    if (removeComment) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            removeComment,
            "comment like field removed successfully."
          )
        );
    }

    const deleteDoc = await Like.findOneAndDelete({
      comment: commentId,
      likedBy: req.user._id,
      $and: [{ video: { $exists: false } }, { tweet: { $exists: false } }],
    });
    if (deleteDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            deleteDoc,
            "Toggled comment likes by deleting document."
          )
        );
    }

    const findDoc = await Like.findOneAndUpdate(
      {
        likedBy: req.user._id,
        $or: [{ video: { $exists: true } }, { tweet: { $exists: true } }],
        comment: { $exists: false },
      },
      {
        $set: {
          comment: commentId,
        },
      },
      {
        new: true,
      }
    );
    if (findDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            findDoc,
            "Commend like toggled by setting comment field successfully."
          )
        );
    }

    const likeComment = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (!likeComment) {
      throw new ApiError(500, "Comment like failed.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "Comment liked successfully."));
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Provide valid tweet id");
  }
  try {
    const removeTweet = await Like.findOneAndUpdate(
      {
        tweet: tweetId,
        likedBy: req.user._id,
        $or: [{ comment: { $exists: true } }, { video: { $exists: true } }],
      },
      {
        $unset: {
          tweet: true,
        },
      },
      {
        new: true,
      }
    );
    if (removeTweet) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            removeTweet,
            "Tweet like field removed successfully."
          )
        );
    }

    const deleteDoc = await Like.findOneAndDelete({
      tweet: tweetId,
      likedBy: req.user._id,
      $and: [{ video: { $exists: false } }, { comment: { $exists: false } }],
    });
    if (deleteDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            deleteDoc,
            "Toggled tweet likes by deleting document."
          )
        );
    }

    const findDoc = await Like.findOneAndUpdate(
      {
        likedBy: req.user._id,
        $or: [{ video: { $exists: true } }, { comment: { $exists: true } }],
        tweet: { $exists: false },
      },
      {
        $set: {
          tweet: tweetId,
        },
      },
      {
        new: true,
      }
    );
    if (findDoc) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            findDoc,
            "Tweet like toggled by setting tweet field successfully."
          )
        );
    }

    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    if (!likeTweet) {
      throw new ApiError(500, "Tweet like failed.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, likeTweet, "Tweet liked successfully."));
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message));
  }
});

const getAllLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Valid userid is required.");
  }

  try {
    const allLikedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: userId,
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline: [
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                duration: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          video: {
            $arrayElemAt: ["$video", 0],
          },
        },
      },
      {
        $project: {
          video: 1,
        },
      },
    ]);
    if (!allLikedVideos?.length) {
      throw new ApiError(404, "No liked videos found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, allLikedVideos, "Fetched all liked videos."));
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error?.message));
  }
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getAllLikedVideos,
};
