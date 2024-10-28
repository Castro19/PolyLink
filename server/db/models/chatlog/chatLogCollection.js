import db from "../../connection.js";

const chatLogCollection = db.collection("chatLogs");

// Create
export const addLog = async (logData) => {
  try {
    const result = await chatLogCollection.insertOne(logData);
    return result;
  } catch (error) {
    throw new Error("Error creating a new Log: " + error.message);
  }
};

// Read
export const fetchLogsByUserId = async (userId) => {
  try {
    const logs = await chatLogCollection.find({ userId: userId }).toArray();
    return logs;
  } catch (error) {
    throw new Error("Error fetching logs: " + error.message);
  }
};

// Update
export const updateLogContent = async (
  logId,
  firebaseUserId,
  content,
  timestamp
) => {
  try {
    const result = await chatLogCollection.updateOne(
      { _id: logId },
      {
        $set: {
          userId: firebaseUserId,
          content: content, // Ensure content is handled correctly as per your schema
          timestamp: timestamp, // This should be a single datetime value
        },
      }
    );
    return result;
  } catch (error) {
    throw new Error("Error updating log: " + error.message);
  }
};

export const updateChatMessageReaction = async (
  logId,
  botMessageId,
  userReaction
) => {
  // Use the positional operator to find the message within the content array
  const result = await chatLogCollection.updateOne(
    { _id: logId, "content.id": botMessageId }, // Find the document with matching _id and content.id
    { $set: { "content.$.userReaction": userReaction } } // Use the positional operator $ to target the matching element in content array
  );

  return result;
};
// Delete
export const deleteLogItem = async (logId) => {
  try {
    const result = await chatLogCollection.deleteOne({ _id: logId });
    return result;
  } catch (error) {
    throw new Error("Error Deleting log: " + error.message);
  }
};
