import * as messageAnalyticsModel from "./messageAnalyticsCollection.js";

// create
export const createMessageAnalytics = async (messageAnalyticsData) => {
  try {
    // Convert timestamps to Date objects if they aren't already
    const sanitizedData = {
      ...messageAnalyticsData,
      createdAt: new Date(messageAnalyticsData.createdAt),
    };

    const result =
      await messageAnalyticsModel.addMessageAnalytics(sanitizedData);

    return result;
  } catch (error) {
    throw new Error(
      "Error creating message analytics in database: " + error.message
    );
  }
};

export const updateMessageAnalytics = async (userMessageId, updateData) => {
  try {
    const result = await messageAnalyticsModel.updateMessageAnalytics(
      userMessageId,
      updateData
    );
    return result;
  } catch (error) {
    throw new Error(
      "Error updating message analytics in database: " + error.message
    );
  }
};
export const updateMessageAnalyticsReaction = async (
  botMessageId,
  userReaction
) => {
  try {
    const result = await messageAnalyticsModel.updateMessageAnalyticsReaction(
      botMessageId,
      userReaction
    );
    return result;
  } catch (error) {
    throw new Error(
      "Error updating message analytics reaction in database: " + error.message
    );
  }
};