import {
  MessageAnalyticsTokenAnalytics,
  RunningStreamData,
} from "@polylink/shared/types";
import { Response } from "express";
import { openai } from "../../index.js";
import { calculateCost } from "../openAI/costFunction.js";
import { updateMessageAnalytics } from "../../db/models/analytics/messageAnalytics/messageAnalyticsServices.js";
import { AssistantStreamEvent } from "openai/resources/beta/assistants.mjs";
import { Run } from "openai/resources/beta/threads/runs/runs.mjs";

// Define event data interfaces if possible (replace with actual types if known)
interface RunData {
  id: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

interface EventObject {
  event: string;
  data: RunData;
}

export async function runAssistantAndStreamResponse(
  threadId: string,
  assistantId: string,
  res: Response,
  userMessageId: string,
  runningStreams: RunningStreamData
): Promise<void> {
  try {
    // Check if the request was canceled before starting the stream
    if (runningStreams[userMessageId]?.canceled) {
      if (!res.headersSent) {
        res.status(200).end(); // End the response
      }
      return;
    }

    const run = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    let runId: string | null = null;

    run.on("event", async (event: AssistantStreamEvent) => {
      try {
        const runData = event.data as Run;

        if (runId === null) {
          runId = runData.id;
          runningStreams[userMessageId].runId = runId;

          // Check if canceled
          if (runningStreams[userMessageId]?.canceled) {
            try {
              if (!res.headersSent) {
                res.status(200).end(); // End the response
              }
              return;
            } catch (error: any) {
              console.error("Error cancelling run:", error);
              if (!res.headersSent) {
                res.status(500).end("Error cancelling run");
              }
              return;
            }
          }
        }

        if (event.event === "thread.run.completed") {
          // Remove this run from runningStreams
          delete runningStreams[userMessageId];

          if (runData.usage && runData.model) {
            const cost = calculateCost(runData.usage, runData.model);
            const tokenAnalytics = {
              modelType: runData.model,
              promptTokens: runData.usage.prompt_tokens,
              completionTokens: runData.usage.completion_tokens,
              totalTokens: runData.usage.total_tokens,
              promptCost: cost.promptCost,
              completionCost: cost.completionCost,
              totalCost: cost.totalCost,
            };
            updateMessageAnalytics(
              userMessageId,
              tokenAnalytics as MessageAnalyticsTokenAnalytics
            ).catch((error: any) =>
              console.error("Failed to update message analytics:", error)
            );
          }
        }
      } catch (error: any) {
        console.error("Error in event handler:", error);
        // Clean up runningStreams
        if (runningStreams[userMessageId]) {
          delete runningStreams[userMessageId];
        }
        if (!res.headersSent) {
          res.status(500).end("An error occurred.");
        }
      }
    });

    run.on("textDelta", (textDelta) => {
      try {
        res.write(textDelta.value);
      } catch (error: any) {
        console.error("Error writing text delta:", error);
      }
    });

    run.on("end", () => {
      try {
        res.end();
      } catch (error: any) {
        console.error("Error ending response:", error);
      }
    });

    run.on("error", (error: any) => {
      console.error("Run error:", error);
      // Remove this run from runningStreams
      if (runningStreams[userMessageId]) {
        delete runningStreams[userMessageId];
      }
      if (!res.headersSent) {
        res.status(500).end("Failed to process stream.");
      }
    });
  } catch (error: any) {
    console.error("Error in runAssistantAndStreamResponse:", error);
    if (!res.headersSent) {
      res.status(500).end("Failed to process assistant response.");
    } else {
      res.end();
    }
  }
}
export async function runAssistantAndCollectResponse(
  threadId: string,
  assistantId: string,
  userMessageId: string,
  runningStreams: RunningStreamData
): Promise<string> {
  let runId: string | null = null;

  return new Promise<string>((resolve, reject) => {
    try {
      // Check if the request was canceled before starting the run
      if (
        runningStreams[userMessageId]?.canceled ||
        !runningStreams[userMessageId]
      ) {
        if (runningStreams[userMessageId]) {
          delete runningStreams[userMessageId];
        }
        return reject(new Error("Response canceled"));
      }

      const run = openai.beta.threads.runs.stream(threadId, {
        assistant_id: assistantId,
      });

      let assistantResponse = "";

      run.on("event", async (event: AssistantStreamEvent) => {
        try {
          const runData = event.data as Run;

          if (runId === null) {
            runId = runData.id;
            runningStreams[userMessageId].runId = runId;
          }

          // Check if canceled again after receiving event
          if (
            runningStreams[userMessageId]?.canceled ||
            !runningStreams[userMessageId]
          ) {
            if (runningStreams[userMessageId]) {
              delete runningStreams[userMessageId];
            }
            return reject(new Error("Response canceled"));
          }

          if (event.event === "thread.run.completed") {
            // Cleanup the run and thread from runningStreams
            runningStreams[userMessageId].runId = null;
            runningStreams[userMessageId].threadId = null;

            // Handle usage and update analytics if needed
            if (runData.usage && runData.model) {
              const cost = calculateCost(runData.usage, runData.model);
              const tokenAnalytics: MessageAnalyticsTokenAnalytics = {
                modelType: runData.model,
                promptTokens: runData.usage.prompt_tokens,
                completionTokens: runData.usage.completion_tokens,
                totalTokens: runData.usage.total_tokens,
                promptCost: cost.promptCost,
                completionCost: cost.completionCost,
                totalCost: cost.totalCost,
              };
              updateMessageAnalytics(userMessageId, tokenAnalytics).catch(
                (updateError: unknown) =>
                  console.error(
                    "Failed to update message analytics:",
                    updateError
                  )
              );
            }
          }
        } catch (error: unknown) {
          console.error("Error in run event handler:", error);
          if (runningStreams[userMessageId]) {
            delete runningStreams[userMessageId];
          }
          reject(error);
        }
      });

      run.on("textDelta", (textDelta) => {
        assistantResponse += textDelta.value;
      });

      run.on("end", () => {
        resolve(assistantResponse);
      });

      run.on("error", (error: unknown) => {
        console.error("Run error:", error);
        if (runningStreams[userMessageId]) {
          delete runningStreams[userMessageId];
        }
        reject(error);
      });
    } catch (error: unknown) {
      console.error("Error in runAssistantAndCollectResponse:", error);
      if (runningStreams[userMessageId]) {
        delete runningStreams[userMessageId];
      }
      reject(error);
    }
  });
}