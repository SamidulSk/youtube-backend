import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/createTweet").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/updateTweet").patch(updateTweet)
router.route("/deleteTweet").patch(deleteTweet)

export default router