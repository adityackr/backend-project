import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/fileUpload.js';

export const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, password, email, fullName } = req.body;

  console.log('Registering user with details:', {
    username,
    password,
    email,
    fullName,
  });

  // validation - not empty
  if (
    [username, password, email, fullName].some((field) => field?.trim() === '')
  ) {
    throw new ApiError('All fields are required', 400);
  }

  // check if user already exists: username, email
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError('Username or email already in use', 409);
  }

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError('Avatar image is required', 400);
  }

  // upload them to cloudinary, avatar
  const avatarData = await uploadOnCloudinary(avatarLocalPath);
  const coverImageData = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarData) {
    throw new ApiError('Failed to upload avatar image', 500);
  }

  // create user in DB
  const user = await User.create({
    username: username.toLowerCase(),
    password,
    email,
    fullName,
    avatar: avatarData.url,
    coverImage: coverImageData ? coverImageData.url : undefined,
  });

  // remove password and refreshToken from response
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  // check for user creation success/failure
  if (!createdUser) {
    throw new ApiError('User creation failed', 500);
  }

  // return response accordingly
  return res
    .status(201)
    .json(new ApiResponse(201, 'User registered successfully', createdUser));
});
