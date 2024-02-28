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

export { createTweet, updateTweet };
