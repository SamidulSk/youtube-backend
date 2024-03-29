import mongoose from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = await Playlist.create({
        name,
        description,
        user: req.user._id // i have authentication middleware that attaches user to request
    });

    res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
});
// get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const playlists = await Playlist.find({ user: userId });

    res.status(200).json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});
//get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});
//add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});
//remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId.toString());
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});
//delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    await playlist.remove();

    res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
});
// update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.name = name;
    playlist.description = description;
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
