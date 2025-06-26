import { Eval } from "braintrust";
import { Factuality } from "autoevals";
import { runLLM } from "../../src/llm.js";
import { itemsSearchToolDefinition } from "../../src/tools/itemsSearch.js";
import { createToolCallMessage } from "../utils.js";

Eval("ItemsSearch", {
  data: () => [
    {
      input: runLLM({
        messages: [{ role: "user", content: "Найди самую мощную видеокарту" }],
        tools: [itemsSearchToolDefinition]
      }),
      expected: createToolCallMessage(itemsSearchToolDefinition.name)
    },
    {
      input: runLLM({
        messages: [{ role: "user", content: "Найди товар до 1000 рублей" }],
        tools: [itemsSearchToolDefinition]
      }),
      expected: createToolCallMessage(itemsSearchToolDefinition.name)
    },
    {
      input: runLLM({
        messages: [{ role: "user", content: "Покажи самый дорогой товар" }],
        tools: [itemsSearchToolDefinition]
      }),
      expected: createToolCallMessage(itemsSearchToolDefinition.name)
    },
    {
      input: runLLM({
        messages: [{ role: "user", content: "Найди все мышки в продаже" }],
        tools: [itemsSearchToolDefinition]
      }),
      expected: createToolCallMessage(itemsSearchToolDefinition.name)
    }
  ],
  task: () => itemsSearchToolDefinition.name,
  scores: [Factuality]
});
