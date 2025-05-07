import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


const app = express();

app.use(
  cors({
    origin: "http://localhost:8081",
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());


// Import Routes and State it's Functions in Try Catch Block
// import userRouter from "./routes/user.routes.js";
// try {
//   app.use("/api/v1/user", userRouter);
// } catch (error) {
//   console.log('File: app.js', 'Line 35:', error);
//   throw new Error("Error Occured in Routes", error);
// }

//Customer router
import customerRouter from './routes/customer.route.js'
app.use('/api/v1/customer', customerRouter)
//Admin router
import adminRouter from './routes/admin.route.js'

app.use('/api/v1/admin', adminRouter)
export default app
