import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required.");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Tweet creation failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User is required.");
  }

  const userTweets = await Tweet.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 0,
              userName: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
      },
    },
  ]);
  if (!userTweets?.length) {
    throw new ApiError(404, "No tweets found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets, "user tweets fetched successfully.")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!(content?.trim() && tweetId)) {
    throw new ApiError(400, "Provide content and tweet id to update.");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) {
    throw new ApiError(500, "Tweet couldn't update.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required.");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deleteTweet) {
    throw new ApiError(500, "Tweet deletion failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully."));
});

export { createTweet, updateTweet, deleteTweet, getUserTweets };
