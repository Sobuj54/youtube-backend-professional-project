import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  if (!req.user._id) {
    throw new ApiError(400, "User is not logged in.");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Everything is Ok."));
});

export default healthCheck;
