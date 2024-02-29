import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export { addComment };
