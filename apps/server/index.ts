import express from "express";
import userRouter from "./src/routes/user.route";
import projectRouter from "./src/routes/project.route";
import fileRouter from "./src/routes/file.route";
import conversationRouter from "./src/routes/conversation.route";
const port = 4000
const app = express();
app.use(express.json());
app.use('/api/v1/user', userRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1', fileRouter);
app.use('/api/v1', conversationRouter);
app.listen(port, () => {
    console.log(`server is running on ${port}`);
})
