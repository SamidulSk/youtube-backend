import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"  // to generate unique string   header payload(data) verify signature(secret)
import bcrypt from "bcrypt"  // to encrypt and decrypt password


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //searching fast
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,

        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true //searching fast
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String // cloudinary
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password: {
            type: String, //chalange ->encrytion and decryption
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    }, {
    timestamps: true
}
)

userSchema.pre("save", async function (next) {  // prehook to encryt password
    if (this.isModified("password")) {
        this.password = bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {  //add custom method
    return await bcrypt.compare(password, this.password)  //true or false
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,  // payload ka data: database ka data
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,  // payload ka data: database ka data
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}


export const user = mongoose.model("User", userSchema)