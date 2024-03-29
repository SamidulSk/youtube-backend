import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


//get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = {};
    if (userId) {
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        filter.user = userId;
    }

    const sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const videos = await Video.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort);

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id; //i have authentication middleware that attaches user to request

    // Upload video to cloudinary
    const cloudinaryResponse = await uploadOnCloudinary(req.file);

    const video = await Video.create({
        title,
        description,
        videoFile: cloudinaryResponse.secure_url,
        user: userId
    });

    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

//get video by id

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});
//update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (title) {
        video.title = title;
    }
    if (description) {
        video.description = description;
    }
    if (thumbnail) {
        video.thumbnail = thumbnail;
    }

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});
//delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await video.remove();

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
