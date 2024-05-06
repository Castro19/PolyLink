import express from "express";
import {
  createLog,
  getLogsByUser,
  updateLog,
  deleteLog,
} from "../db/models/chatlog/chatLogServices.js";

const router = express.Router();

// Test: Access here `http://localhost:4000/chatLogs`
router.get("/", async (req, res) => {
  res.send("ChatLog Backend Working");
});

// Creating a new Log: (Create)
router.post("/", async (req, res) => {
  try {
    const { currentChatId, firebaseUserId, title, content, timestamp } =
      req.body;
    if (!firebaseUserId) {
      return res.status(400).send("Firebase User ID is required");
    }
    const newLog = {
      _id: currentChatId,
      userId: firebaseUserId,
      title,
      timestamp,
      content,
    };
    console.log("---------Creating the Log--------");
    console.log("New Log in ChatLog.js: ", newLog._id);
    const result = await createLog(newLog);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send("Failed to create log: " + error.message);
    console.error("Failed to create log: ", error);
  }
});

// Get the entire LogList: (Read)
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const logs = await getLogsByUser(userId);
    res.status(200).json(logs);
  } catch (error) {
    console.error("Failed to fetch logs: ", error);
    res.status(500).send("Failed to fetch logs: " + error.message);
  }
});

// Retreive a specific Log: (Read)
// FIX: Add in check for authorization
router.get("/:userId/chat/:logId", async (req, res) => {
  console.log(`Fetching log ${req.params.logId} for user ${req.params.userId}`);
  res.status(200).send(`Log ${req.params.logId} for user ${req.params.userId}`);
});

// Updating a Log: (Update)
router.put("/", async (req, res) => {
  const { logId, firebaseUserId, content, timestamp } = req.body;
  console.log("-----Updating the Log-------");
  console.log("Log ID: ", logId);
  console.log("Firebase User ID: ", firebaseUserId);
  console.log("Content: ", content);
  console.log("Timestamp: ", timestamp);
  try {
    const result = await updateLog(logId, firebaseUserId, content, timestamp);
    res.status(204).json(result); // No Content response on successful update
  } catch (error) {
    console.error("Failed to update log: ", error);
    res.status(500).send("Failed to update log in database: " + error.message);
  }
});

// Deleting a Log
router.delete("/:userId/:logId", async (req, res) => {
  const { logId, userId } = req.params;
  console.log(`Deleting log ${logId} for user ${userId}`);

  try {
    const response = await deleteLog(logId, userId);
    res.status(204).send(response); // 204 No Content is typical for a delete operation.
  } catch (error) {
    console.error("Failed to Delete log: ", error);
    res.status(500).send("Failed to Delete log in database: " + error.message);
  }
});

export default router;
