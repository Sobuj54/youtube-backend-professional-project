import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // 1. get user details from front end
  const { userName, email, fullName, password } = req.body;

  //2. form data validation - not empty
  if (
    [userName, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // 3. check if user already exists - userName and email
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    // remove local files even if the user already exists
    fs.unlinkSync(req.files?.avatar[0]?.path);
    fs.unlinkSync(req.files?.coverImg[0]?.path);
    throw new ApiError(409, "User already exists.");
  }

  // 4. check for images and avatar is required
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImgLocalPath = req.files?.coverImg[0]?.path;
  let coverImgLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImg) &&
    req.files.coverImg.length > 0
  ) {
    coverImgLocalPath = req.files.coverImg[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // 5. upload images and avatar to cloudinary and avatar is required
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(coverImgLocalPath);
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

const loginUser = asyncHandler(async (req, res) => {
  // 1. get data from body
  const { userName, email, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "user name or email is required.");
  }

  // 2. check if user is registered
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist.");
  }

  // 3. check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password.");
  }

  //  4. access token and refresh token
  const { accessToken, refreshToken } = generateAccessTokenAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // console.log(loggedInUser);

  // 5.make secured api
  const options = {
    httpOnly: true,
    secure: true,
  };

  // 6.send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."));
});

export { registerUser, loginUser, logoutUser };
