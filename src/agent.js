import { addMessages, getMessages, saveToolResponse } from "./memory.js";
import { runLLM } from "./llm.js";
import { showLoader, logMessage } from "./ui.js";
import { runTool } from "./toolRunner.js";

export const runAgent = async ({ userMessage, tools }) => {
  await addMessages([{ role: "user", content: userMessage }]);

  const loader = showLoader("🤔");

  while (true) {
    const history = await getMessages();
    const response = await runLLM({ messages: history, tools });

    await addMessages([response]);

    if (response.content) {
      loader.stop();
      logMessage(response);
      return getMessages();
    }

    if (response.tool_calls) {
      const toolCall = response.tool_calls[0];
      logMessage(response);
      loader.update(`executing: ${toolCall.function.name}`);

      const toolResponse = await runTool(toolCall, userMessage);
      if (typeof toolResponse === "string") {
        await saveToolResponse(toolCall.id, toolResponse);
      }
      loader.update(`done: ${toolCall.function.name}`);
    }
  }
};
