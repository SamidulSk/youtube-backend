// DB connection

// process  1
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
dotenv.config( {
    path: './env'
})

import connectDB from "./DB/index.js";


connectDB()
/*
//approach 2
import mongoose from "mongoose";
import  express  from "express";
import {DB_NAME} form "./contant";
const app=express();
; (async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/{DB_NAME}`)
        app.on("error",(error)=>{
            console.log("DB connect but app not able to talk with DB")
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is lintening on port ${process.env.PORT}`)
        })
    }
    catch (error) {
        console.error("Error:", error)
        throw error;
    }
})()
*/