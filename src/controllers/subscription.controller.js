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

  const subscribers = await Subscription.find({ channel: channelId });

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Fetched all subscribers."));
});

export { toggleSubscription, getChannelSubscribers };
