import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title?.trim() && description?.trim())) {
    throw new ApiError(400, "Title and description is required");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;

  if (!(videoFileLocalPath && thumbnailFileLocalPath)) {
    throw new ApiError(400, "video and thumbnail not found");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);

  if (!(videoFile.url && thumbnail.url)) {
    throw new ApiError(500, "Video upload failed");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: Number(videoFile.duration.toFixed(1)),
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video successfully uploaded."));
});

export { publishVideo };
