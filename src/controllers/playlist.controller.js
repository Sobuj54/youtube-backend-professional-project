import mongoose, { isValidObjectId } from "mongoose";
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
      owner: req.user._id,
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
      _id: playlistId,
      videos: { $in: [videoId] },
    });
    if (isAlreadyAdded?.length) {
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
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode, {}, error.message));
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
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode, {}, error.message));
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
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode, {}, error.message));
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Provide valid userId");
  }

  try {
    const userPlaylists = await Playlist.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videos",
          pipeline: [
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
                  $arrayElemAt: ["$owner", 0],
                },
              },
            },
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                owner: 1,
              },
            },
          ],
        },
      },
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
          name: 1,
          description: 1,
          videos: 1,
          owner: 1,
        },
      },
    ]);
    if (!userPlaylists?.length) {
      throw new ApiError(404, "User doesn't have a playlist.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlaylists,
          "User playlists fetched successfully."
        )
      );
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode || 500, {}, error.message));
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required.");
  }

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
      throw new ApiError(404, "No playlist exists by this id.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedPlaylist, "playlist deleted successfully.")
      );
  } catch (error) {
    console.log("err : ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiError(error.statusCode || 500, {}, error.message));
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist is required.");
  }
  if (!(name?.trim() && description?.trim())) {
    throw new ApiError(400, "Name and description is required.");
  }

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      {
        new: true,
      }
    );
    if (!updatedPlaylist) {
      throw new ApiError(404, "No playlist found.");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully.")
      );
  } catch (error) {
    console.log("err: ", error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.statusCode | 500, {}, error?.message));
  }
});

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
  deletePlaylist,
  updatePlaylist,
};
