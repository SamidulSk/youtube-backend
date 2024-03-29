import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js"; // Assuming Video model exists
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comments = await Video.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "allcomments"
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                commentsCount: { $size: "$allcomments" },
                allcomments: { $slice: ["$allcomments", (page - 1) * limit, parseInt(limit)] }
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200, comments[0], "All comments fetched successfully"));
});
//add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { content, video, owner } = req.body;
    if (!content) {
        throw new ApiError(400, "Please add some content");
    }

    const comment = await Comment.create({ video, owner, content });
    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully"));
});
//update comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId, content } = req.body;
    if (!content) {
        throw new ApiError(400, "Please add some content");
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});
//delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
