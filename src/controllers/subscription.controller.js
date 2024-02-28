import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(401, "Channel is not provided.");
  }

  const userId = req.user._id;
  if (channelId == userId) {
    throw new ApiError(400, "User can not subscribe to his/her own channel.");
  }
  //   check if user is already subscribed.if so then unsubscribe
  const isSubscribed = await Subscription.findOneAndDelete({
    subscriber: userId,
    channel: channelId,
  });
  if (isSubscribed) {
    return res
      .status(200)
      .json(new ApiResponse(200, isSubscribed, "Channel unsubscribed."));
  }

  //   if user is not already subscribed then subscribe the channel.
  const subscribed = await Subscription.create({
    subscriber: userId,
    channel: channelId,
  });
  if (!subscribed) {
    throw new ApiError(500, "Subscription failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribed, "User subscribed successfully."));
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(404, "Channel id is required.");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
              coverImg: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
              coverImg: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
        channel: {
          $first: "$channel",
        },
      },
    },
    {
      $project: {
        subscriber: 1,
        channel: 1,
      },
    },
  ]);
  if (!subscribers) {
    throw new ApiError(404, "No subscribers found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers[0], "Fetched all subscribers."));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Channel is required.");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  });
  if (!subscribedChannels) {
    throw new ApiError(404, "No subscribed channels found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully."
      )
    );
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
