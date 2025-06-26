import { addMessages, getMessages, saveToolResponse } from "./memory.js";
import { runLLM, runApprovalCheck } from "./llm.js";
import { showLoader, logMessage } from "./ui.js";
import { runTool } from "./toolRunner.js";
import { resetMemoryToolDefinition } from "./tools/resetMemory.js";

const handleResetMemoryApprovalFlow = async (history, userMessage) => {
  const lastMessage = history[history.length - 1];
  const toolCall = lastMessage?.tool_calls?.[0];

  if (!toolCall || toolCall.function.name !== resetMemoryToolDefinition.name) {
    return false;
  }

  const loader = showLoader("Ожидаем подтверждения...");
  const approved = await runApprovalCheck(userMessage);

  if (approved) {
    loader.update(`Выполнение инструмента: ${toolCall.function.name}`);
    const toolResponse = await runTool(toolCall, userMessage);

    loader.update(`Закончено: ${toolCall.function.name}`);
  } else {
    await saveToolResponse(toolCall.id, "Запрос на сброс памяти отклонен.");
  }

  loader.stop();

  return true;
};

export const runAgent = async ({ userMessage, tools }) => {
  const history = await getMessages();
  const isResetMemoryApproval = await handleResetMemoryApprovalFlow(history, userMessage);

  // Hide Yes/No question if not reset memory
  if (!isResetMemoryApproval) {
    await addMessages([{ role: "user", content: userMessage }]);
  }

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

      if (toolCall.function.name === resetMemoryToolDefinition.name) {
        loader.update("Нужно ваше подтверждение для сброса памяти");
        loader.stop();
        return getMessages();
      }

      const toolResponse = await runTool(toolCall, userMessage);
      await saveToolResponse(toolCall.id, toolResponse);
      loader.update(`done: ${toolCall.function.name}`);
    }
  }
};
