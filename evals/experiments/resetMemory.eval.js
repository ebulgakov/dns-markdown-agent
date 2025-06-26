import { Eval } from "braintrust";
import { Factuality } from "autoevals";
import { runLLM } from "../../src/llm.js";
import { resetMemoryToolDefinition } from "../../src/tools/resetMemory.js";
import { createToolCallMessage } from "../utils.js";

Eval("ResetMemory", {
  data: () => [
    {
      input: runLLM({
        messages: [{ role: "user", content: "Очисти память" }],
        tools: [resetMemoryToolDefinition]
      }),
      expected: createToolCallMessage(resetMemoryToolDefinition.name)
    }
  ],
  task: () => "Запрос на сброс памяти",
  scores: [Factuality]
});
