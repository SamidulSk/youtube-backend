import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongooseAggregatePaginate"
const videoSchema = new Schema(
    {
        videoFile: { // cloudinary url
            type: String,
            required: true
        },
        thumbnail: { // cloudinary url
            type: String,
            required: true
        },
        title: { 
            type: String,
            required: true
        },
        description: { 
            type: String,
            required: true
        },
        duration: { 
            type: Number,  //cloudinary
            required: true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"user"
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate) // now we can write aggregation query->aggregation pipeline
export const video = mongoose.model("Video", videoSchema)