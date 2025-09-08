import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN ,// to specifically mention the cors origin
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
//to encode the url
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import for default cases
import userRouter from './routes/user.routes.js'



//routes declaration 
app.use("/api/v1/users", userRouter)

export { app }