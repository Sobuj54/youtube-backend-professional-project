import mongoose from "mongoose";
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

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sort = "title",
    sortBy = "asc",
    userId,
  } = req.query;
  if (!userId) {
    throw new ApiError(400, "User id is required in query.");
  }

  page = parseInt(page);
  limit = parseInt(limit);

  let matchQuery = { owner: new mongoose.Types.ObjectId(userId) };
  if (query) {
    matchQuery.$or = [
      { title: { $regex: query, $options: "i" } }, //case insensitive search on title
      { description: { $regex: query, $options: "i" } }, //case insensitive search on description
    ];
  }

  const sortOptions = {};
  sortOptions[sort] = sortBy === "asc" ? 1 : -1;

  const options = {
    page,
    limit,
    sort: sortOptions,
  };

  const videoAggregate = Video.aggregate([
    //we must not use await before this aggregation because of aggregatePaginate documentation otherwise we won't get proper result.
    {
      $match: matchQuery,
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
          $arrayElemAt: ["$owner", 0], //this gives first element of the array in the field
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        owner: 1,
      },
    },
  ]);

  const result = await Video.aggregatePaginate(videoAggregate, options);
  if (!result) {
    throw new ApiError("No result found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "All videos fetched successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully."));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is not found.");
  }

  const { title, description } = req.body;
  if (!(title && description)) {
    throw new ApiError(400, "Provide title and description");
  }

  const video = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user._id,
    },
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(401, "Unauthorized.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id not found.");
  }

  const isDeleted = await Video.findOneAndDelete(
    {
      _id: videoId,
      owner: req.user._id,
    },
    {
      new: true,
    }
  );
  if (!isDeleted) {
    throw new ApiError(401, "Unauthorized!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is required.");
  }

  const toggledVideo = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user?._id,
    },
    [
      //used an array here because $set is using aggregate operators inside
      {
        $set: {
          isPublished: {
            $cond: {
              if: { $eq: ["$isPublished", true] }, //check if isPublished is true or not
              then: false, //if true, set false
              else: true, //if false , set true
            },
          },
        },
      },
    ],
    {
      new: true,
    }
  );
  if (!toggledVideo) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        toggledVideo,
        "Published status toggled successfully."
      )
    );
});

export {
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  getAllVideos,
  togglePublishStatus,
};
