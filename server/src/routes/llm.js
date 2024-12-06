import dotenv from "dotenv";
dotenv.config();
import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { openai } from "../index.js";
import { handleFileUpload } from "../helpers/azure/blobFunctions.js";
import asyncHandler from "../middlewares/asyncMiddleware.js";
import handleSingleAgentModel from "../helpers/assistants/singleAgent.js";
import handleMultiAgentModel from "../helpers/assistants/multiAgent.js";
const router = express.Router();

//init storage for user documents
const upload = multer({ dest: "temp/" }); // 'temp/' is where Multer stores uploaded files

// Rate limiter for GPT messages
const messageRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window (in milliseconds)
  max: 25, // limit each user to 25 messages per hour
  message:
    "You have exceeded the message limit of 25 messages per hour. Please try again later.",
  headers: true,
  keyGenerator: (req) => req.body.userId, // requests are tracked per firebase userId
});

const MAX_FILE_SIZE_MB = 1;
// Store running streams: Useful for cancelling a running stream
const runningStreams = {};

router.post(
  "/respond",
  messageRateLimiter,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/plain"); // Set MIME type for plain text stream
      res.setHeader("Transfer-Encoding", "chunked");
    }
    const { message, chatId, userId, userMessageId } = req.body;
    const model = JSON.parse(req.body.currentModel);
    const file = req.file;

    let userFile = null;
    // Current state of the stream
    runningStreams[userMessageId] = {
      canceled: false,
      runId: null,
      threadId: null,
    };

    // Add file size validation
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);

      // Check if file is PDF
      if (!file.mimetype || !file.mimetype.includes("pdf")) {
        return res.status(400).send("Only PDF files are allowed");
      }

      // Check file size (file.size is in bytes, convert MB to bytes for comparison)
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        return res
          .status(413)
          .send(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
      }

      if (model.title !== "Matching Assistant") {
        try {
          userFile = await handleFileUpload(file);
        } catch (error) {
          console.error("Error uploading file to OpenAI File Storage:", error);
        }
      }
    }

    if (model.title === "Professor & Course Advisor") {
      try {
        await handleMultiAgentModel({
          model,
          message,
          res,
          userMessageId,
          runningStreams,
        });
      } catch (error) {
        console.error("Error in multi-agent model:", error);
        if (!res.headersSent) {
          res.status(500).send("Failed to process request.");
        } else {
          res.end();
        }
      }
    } else {
      try {
        await handleSingleAgentModel({
          model,
          chatId,
          userFile,
          message,
          res,
          userId,
          userMessageId,
          runningStreams,
        });
      } catch (error) {
        console.error("Error in single-agent model:", error);
        if (!res.headersSent) {
          res.status(500).send("Failed to process request.");
        } else {
          res.end();
        }
      }
    }
  })
);
router.post(
  "/cancel",
  asyncHandler(async (req, res) => {
    const { userMessageId } = req.body;

    const runData = runningStreams[userMessageId];
    if (runData) {
      runData.canceled = true;
      if (runData.runId && runData.threadId) {
        try {
          await openai.beta.threads.runs.cancel(
            runData.threadId,
            runData.runId
          );
          if (runningStreams[userMessageId]) {
            delete runningStreams[userMessageId];
          }
          res.status(200).send("Run(s) cancelled");
          return;
        } catch (error) {
          console.error("Error cancelling run(s):", error);
          res.status(500).send("Error cancelling run(s)");
          return;
        }
      } else {
        // `runId` not yet available; cancellation flag is set
        res.status(200).send("Run cancellation requested");
        return;
      }
    } else {
      res.status(404).send("Run not found");
      return;
    }
  })
);

router.post(
  "/title",
  asyncHandler(async (req, res) => {
    try {
      const { message } = req.body;

      const contentStr =
        "Based on the user's message and the model description, please return a 10-30 character title response that best suits the user's message. Important The response should not be larger than 30 chars and should be a title!";
      // model: "gpt-3.5-turbo-0125",
      // model: "gpt-4-0613",
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: contentStr,
          },
          { role: "user", content: message },
        ],
      });

      // Send the ChatGPT response back to the client
      const title = chatCompletion.choices[0].message.content;
      res.json({ title: title });
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      res
        .status(500)
        .json({ error: "Failed to generate response from OpenAI" });
    }
  })
);

export default router;