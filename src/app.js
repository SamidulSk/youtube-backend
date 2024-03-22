import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({  //middle ware
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json( {limit:"10kb"})) //handle json file using middleware
app.use(express.urlencoded( {extended:true,limit:"10kb"})) // handle url
app.use(express.static("public")) //favicon, image for public


app.use(cookieParser()) // to set cookie on users brower from server


// routes import

import userRouteRegister from './routes/user.routes.js'
// route declaration
app.use("/api/v1/users",userRouteRegister)
// http://localhost:8000/users/register
 
export {app}