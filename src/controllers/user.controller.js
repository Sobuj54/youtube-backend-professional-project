import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. get user details from front end
  const { userName, email, fullName, password } = req.body;
  console.log({ userName, email, fullName, password });

  //2. form data validation - not empty
  if (
    [userName, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // 3. check if user already exists - userName and email
  const existingUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  // 4. check for images and avatar is required
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImgLocalPath = req.files?.coverImg[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // 5. upload images and avatar to cloudinary and avatar is required
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // 6. create user object - create an entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg: coverImg?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  // 7. remove password and refreshToken from response
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //this select removes the given field name preceding with -

  // 8. check for user creation
  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering user.");
  }

  // 9. send res
  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User Registered Successfully."));
});

export { registerUser };
