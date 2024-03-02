import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!(name?.trim() && description?.trim())) {
    throw new ApiError(404, "Name and description is required.");
  }

  try {
    const newPlaylist = await Playlist.create({
      name,
      description,
    });
    if (!newPlaylist) {
      throw new ApiError(500, "New playlist creation failed.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, newPlaylist, "New playlist created successfully.")
      );
  } catch (error) {
    console.log("err : ", error);
    throw new ApiError(500, "New playlist failed.");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlist id and video id is must.");
  }
  const isValid = isValidObjectId(videoId);
  if (!isValid) {
    throw new ApiError(400, "Video id is not valid.");
  }

  try {
    const doesVideoExists = await Video.findById(videoId);
    if (!doesVideoExists) {
      throw new ApiError(404, "No video exists by this id.");
    }

    const isAlreadyAdded = await Playlist.find({
      videos: { $in: [videoId] },
    });
    if (isAlreadyAdded) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            isAlreadyAdded,
            "You've already added this in playlist."
          )
        );
    }

    const addVideo = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $push: {
          videos: videoId,
        },
      },
      { new: true }
    );
    if (!addVideo) {
      throw new ApiError(404, "Playlist not found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, addVideo, "Video added to Playlist successfully.")
      );
  } catch (error) {
    console.log("err : ", error);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(404, "playlist id and video id is required.");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      { new: true }
    );
    if (!playlist) {
      throw new ApiError(404, "No playlist found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Removed video from playlist successfully."
        )
      );
  } catch (error) {
    console.log("err: ", error);
    return res.status(500).json(new ApiResponse(500, {}, error.message));
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(404, "Valid playlist id is required.");
  }

  try {
    const playlist = await Playlist.findById(playlistId, {
      name: 1,
      description: 1,
      videos: 1,
    });
    if (!playlist) {
      throw new ApiError(404, "No Playlist found.");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist fetched successfully."));
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
});

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
};
