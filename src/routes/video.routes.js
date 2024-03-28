import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );


    router.route("/getAllVideos").get(getAllVideos)
    router.route("/publishAVideo").post(publishAVideo)
    router.route("/getVideoById").get(getVideoById)
    router.route("/updateVideo").patch(verifyJWT,updateVideo)
    router.route("/deleteVideo").patch(verifyJWT,deleteVideo)
    router.route("/togglePublishStatus").patch(verifyJWT,togglePublishStatus)
    

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router