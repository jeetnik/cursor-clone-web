import express from "express";
const port=process.env.port||4000
const app=express();
app.use(express.json());
console.log(port);
app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})
