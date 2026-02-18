import express from "express";
import userRouter from "./src/routes/user.route";
const port=4000
const app=express();
app.use(express.json());
app.use('/api/v1/user',userRouter);
app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})
