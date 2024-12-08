import { MessageAnalyticsTokenAnalytics } from "@polylink/shared/types";
import { Response } from "express";
import { openai } from "../../index.js";
import { calculateCost } from "../openAI/costFunction.js";
import { updateMessageAnalytics } from "../../db/models/analytics/messageAnalytics/messageAnalyticsServices.js";
import { AssistantStreamEvent } from "openai/resources/beta/assistants.mjs";
import { Run } from "openai/resources/beta/threads/runs/runs.mjs";

export async function runAssistantAndStreamResponse(
  threadId: string,
  assistantId: string,
  res: Response,
  userMessageId: string,
  abortController: AbortController
): Promise<void> {
  console.log(
    "runAssistantAndStreamResponse abortController: ",
    abortController
  );
  try {
    const run = openai.beta.threads.runs.stream(
      threadId,
      {
        assistant_id: assistantId,
      },
      {
        signal: abortController.signal,
      }
    );
    console.log("RUN CREATED", run);

    let runId: string | null = null;

    run.on("event", async (event: AssistantStreamEvent) => {
      try {
        console.log("abortController.signal: ", abortController.signal);

        const runData = event.data as Run;

        if (runId === null) {
          runId = runData.id;
          console.log("RUN ID SET", runId);

          if (event.event === "thread.run.completed") {
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
              ).catch((error: unknown) =>
                console.error("Failed to update message analytics:", error)
              );
            }
          }
          if (event.event === "thread.run.cancelled") {
            console.log("RUN CANCELLED");
          }
        }
      } catch (error: unknown) {
        console.error("Error in event handler:", error);

        if (!res.headersSent) {
          res.status(500).end("An error occurred.");
        }
      }
    });

    run.on("textDelta", (textDelta) => {
      try {
        res.write(textDelta.value);
      } catch (error: unknown) {
        console.error("Error writing text delta:", error);
      }
    });
    run.on("end", () => {
      try {
        res.end();
      } catch (error: unknown) {
        console.error("Error ending response:", error);
      }
    });

    run.on("error", (error: unknown) => {
      console.error("Run error:", error);

      if (!res.headersSent) {
        console.log("ERROR", error);
        if ((error as { name: string }).name === "AbortError") {
          // This indicates the request was aborted, not a server error
          res.status(499).end("Client closed request");
        } else {
          res.status(500).end("Failed to process stream.");
        }
      }
    });
  } catch (error: unknown) {
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
  abortController: AbortController
): Promise<string> {
  let runId: string | null = null;

  return new Promise<string>((resolve, reject) => {
    try {
      // Check if the request was canceled before starting the run
      if (abortController.signal.aborted) {
        return reject(new Error("Response canceled"));
      }

      const run = openai.beta.threads.runs.stream(
        threadId,
        {
          assistant_id: assistantId,
        },
        {
          signal: abortController.signal,
        }
      );

      let assistantResponse = "";

      run.on("event", async (event: AssistantStreamEvent) => {
        try {
          const runData = event.data as Run;

          if (runId === null) {
            runId = runData.id;
          }

          // Check if canceled again after receiving event
          if (abortController.signal.aborted) {
            return reject(new Error("Response canceled"));
          }

          if (event.event === "thread.run.completed") {
            // Cleanup the run and thread from runningStreams
            runId = null;

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
        reject(error);
      });
    } catch (error: unknown) {
      console.error("Error in runAssistantAndCollectResponse:", error);
      reject(error);
    }
  });
}
