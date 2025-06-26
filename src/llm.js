import { z } from "zod";
import { zodFunction, zodResponseFormat } from "openai/helpers/zod";
import { openai } from "./ai.js";
import { systemPrompt } from "./systemPrompt.js";
export const runLLM = async ({ messages, tools }) => {
  const formattedTools = tools.map(zodFunction);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    tools: formattedTools,
    tool_choice: "auto",
    parallel_tool_calls: false
  });

  return response.choices[0].message;
};

export const runApprovalCheck = async userMessage => {
  const response = await openai.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: zodResponseFormat(
      z.object({
        approved: z.boolean().describe("сказал ли пользователь, что он одобряет или нет?")
      }),
      "math_reasoning"
    ),
    messages: [
      {
        role: "system",
        content:
          "Определите, одобрил ли пользователь запуск инструмента. Если вы не уверены, значит, оно не одобрено."
      },
      { role: "user", content: userMessage }
    ]
  });

  return response.choices[0].message.parsed?.approved;
};
