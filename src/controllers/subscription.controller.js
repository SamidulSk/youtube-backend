import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; // i have authentication middleware that attaches user to request

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const subscription = await Subscription.findOne({ subscriber: userId, channel: channelId });

    if (subscription) {
        await subscription.remove();
        return res.status(200).json(new ApiResponse(200, null, "Subscription removed successfully"));
    } else {
        await Subscription.create({ subscriber: userId, channel: channelId });
        return res.status(200).json(new ApiResponse(200, null, "Subscription added successfully"));
    }
});
//controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber");

    return res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
});
//controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate("channel");

    return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
