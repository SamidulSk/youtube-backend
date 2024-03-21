// DB connection

// process  1
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./DB/index.js";
dotenv.config( {
    path: './env'
})

connectDB()
.then( ()=>{
    app.on("error",(error)=>{
        console.error("Error:-",error)
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at prot :${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("mongoDB db connection failed")
})
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