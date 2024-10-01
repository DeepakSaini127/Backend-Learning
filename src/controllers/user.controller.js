import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const genetateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return { accessToken, refreshToken }



  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};




const registarUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username alrady exists.");
  }

  const avatarLocalPath =  req.files?.avatar[0].path;
  const coverImageLocalPath =  req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is requier");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "Avatar file path is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User regestered Successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body say data lana
  // username or email check
  // find the user in database
  // password check in database
  // access and refresh token
  // send cookie

  const { email, username, password } = req.body;

  
  if ( !username && !email ) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User dose not exist.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials(Wrong Password)");
  }

    const {accessToken, refreshToken} = await genetateAccessAndRefreshTokens(user._id)


 const loggedInUser = await User.findById(user._id).select(
  "-password -refreshToken"
 )

 const options = {
  httpOnly: true,
  secure : true,
 }
 return res
 .status(200)
 .cookie("accessToken", accessToken, options)
 .cookie("refreshToken", refreshToken, options)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser, accessToken, refreshToken
    },
    "User Logged in Successfully"
  )
 )
});

const logoutUser = asyncHandler( async (req, res)=>{

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )


  const options = {
    httpOnly: true,
    secure : true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .cookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User Logged out"))









})












export { registarUser, loginUser, logoutUser };
