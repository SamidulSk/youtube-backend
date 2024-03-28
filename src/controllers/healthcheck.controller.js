
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Simply return a 200 OK status with a message
    return res.status(200).json(
        new ApiResponse(200, {}, "Everything is okay")
    );
});

export {
    healthcheck
};
