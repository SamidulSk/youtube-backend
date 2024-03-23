import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})) // handle json file 
app.use(express.urlencoded({extended: true, limit: "16kb"})) // handle url
app.use(express.static("public"))
app.use(cookieParser())


// routes import

import userRouter from './routes/user.routes.js'
// route declaration
app.use("/api/v1/users", userRouter)
// http://localhost:8000/api/v1/users/register

export { app }