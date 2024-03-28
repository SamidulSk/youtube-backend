import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const userId = req.user._id; 

    const existingLike = await Like.findOne({ user: userId, video: videoId });

    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    } else {
        const newLike = await Like.create({ user: userId, video: videoId });
        return res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const userId = req.user._id; // i  have authentication middleware that attaches user to request

    const existingLike = await Like.findOne({ user: userId, comment: commentId });

    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    } else {
        const newLike = await Like.create({ user: userId, comment: commentId });
        return res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const userId = req.user._id; // i have authentication middleware that attaches user to request

    const existingLike = await Like.findOne({ user: userId, tweet: tweetId });

    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    } else {
        const newLike = await Like.create({ user: userId, tweet: tweetId });
        return res.status(200).json(new ApiResponse(200, newLike, "Like added successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // i have authentication middleware that attaches user to request

    const likedVideos = await Like.find({ user: userId, video: { $exists: true } }).populate("video");

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
