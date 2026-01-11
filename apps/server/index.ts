import express from "express";
import userRouter from "./router/userRouter";
const app=express();
const port=4000;
app.use(express.json());
app.use("/api/v1/user/",userRouter);
app.listen(port,()=>{
    console.log(`server is runnig on port ${port}`);
})