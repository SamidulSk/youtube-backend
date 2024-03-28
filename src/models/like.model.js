import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema({
    video:{    // konsi video me like
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    // comment:{   // konsi comment me like
    //     typeof:Schema.Types.ObjectId,
    //     ref:"Comment"
    // },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Like=mongoose.model("Like",likeSchema)