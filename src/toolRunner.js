import { itemsSearch, itemsSearchToolDefinition } from "./tools/itemsSearch.js";
import { resetMemory, resetMemoryToolDefinition } from "./tools/resetMemory.js";

export const runTool = async (toolCall, userMessage) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments || "{}")
  };

  switch (toolCall.function.name) {
    case itemsSearchToolDefinition.name:
      return itemsSearch(input);
    case resetMemoryToolDefinition.name:
      return resetMemory(input);

    default:
      return `Такой инструмент не существует: ${toolCall.function.name}!`;
  }
};
