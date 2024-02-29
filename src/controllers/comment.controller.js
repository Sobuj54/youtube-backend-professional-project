import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Video id is required.");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  try {
    const allComments = Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
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
                userName: 1,
                fullName: 1,
              },
            },
          ],
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
                title: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          video: {
            $first: "$video",
          }, //$first and $arrayElemAt does the same thing.return first array element.
          owner: {
            $arrayElemAt: ["$owner", 0],
          },
        },
      },
      {
        $project: {
          content: 1,
          video: 1,
          owner: 1,
        },
      },
    ]);

    const commentsPaginate = await Comment.aggregatePaginate(
      allComments,
      options
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          commentsPaginate,
          "All comments fetched successfully."
        )
      );
  } catch (error) {
    console.log("err : ", error);
    throw new ApiError(500, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!(videoId && content?.trim())) {
    throw new ApiError(400, "Video id and content is required.");
  }

  const newComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  if (!newComment) {
    throw new ApiError(500, "Comment creation failed.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment created successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!(commentId && content?.trim())) {
    throw new ApiError(400, "comment id and content is required.");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(500, "Comment update failed.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated successfully.")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required.");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(500, "Comment deletion failed.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedComment, "Comment deleted successfully.")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
