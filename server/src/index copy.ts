import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";

import { connectToDb, getDb } from "./db/connection";
import { authenticate } from "./middlewares/authMiddleware.js";
// Routes
import authRouter from "./routes/auth.js";
import users from "./routes/user.js";
import llms from "./routes/llm.js";
import chatLogs from "./routes/chatLog.js";
import gpts from "./routes/gpt.js";
import courses from "./routes/courses.js";
import flowchart from "./routes/flowchart.js";
import flowInfo from "./routes/flowInfo.js";
import messageAnalytics from "./routes/analytics/messageAnalytics.js";
import professorRatings from "./routes/professorRating.js";
// import assistants from "./routes/assistants.js";
// import signupAccessRouter from "./routes/signupAccess.js";
// import generateTeacherFileRoute from "./routes/teacherFile.js";
// import fileOperations from "./routes/fileOperations.js";
// LLM API
import OpenAI from "openai";

// Initialize express app
const app = express();
const port = process.env.PORT || 4000;

const serviceAccount = JSON.parse(
  readFileSync("./helpers/firebase/laep-firebase.json", "utf8")
);

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // Enable CORS
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.use(express.text({ type: "text/plain" }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Routes
app.use("/auth", authRouter);
app.use("/llms", llms);
app.use("/courses", authenticate, courses);
app.use("/users", authenticate, users);
app.use("/chatLogs", authenticate, chatLogs);
app.use("/gpts", authenticate, gpts);
app.use("/flowchart", authenticate, flowchart);
app.use("/flowInfo", authenticate, flowInfo);
app.use("/analytics", authenticate, messageAnalytics);
app.use("/professorRatings", authenticate, professorRatings);
// app.use("/assistants", authenticate, assistants);
// app.use("/signupAccess", signupAccessRouter);
// app.use("/generateTeacherFile", generateTeacherFileRoute);
// app.use("/fileOperations", fileOperations);

// Initialize OpenAI API client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const formatAssistantId = process.env.FORMAT_ASST_ID;
export const qdrant = {
  qdrantUrl: process.env.QDRANT_URL,
  qdrantApiKey: process.env.QDRANT_API_KEY,
};
// Connect to the database and start the server
connectToDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });