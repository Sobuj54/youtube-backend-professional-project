import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { createPlaylist };
