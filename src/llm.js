import { z } from "zod";
import { zodFunction, zodResponseFormat } from "openai/helpers/zod";
import { openai } from "./ai.js";
import { systemPrompt as defaultSystemPrompt } from "./systemPrompt.js";
import { getSummary } from "./memory.js";

export const runLLM = async ({ messages, tools, systemPrompt }) => {
  const formattedTools = tools?.map(zodFunction);
  const summary = await getSummary(messages);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: `${systemPrompt || defaultSystemPrompt}. Краткое изложение разговора на данный момент: ${summary}`
      },
      ...messages
    ],
    ...(formattedTools &&
      formattedTools.length > 0 && {
        tools: formattedTools,
        tool_choice: "auto",
        parallel_tool_calls: false
      })
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

export const summarizeMessages = async messages => {
  const response = await runLLM({
    systemPrompt:
      "Обобщите ключевые моменты разговора в краткой форме, которая была бы полезна как контекст для будущих взаимодействий. Сделайте это как пошаговое описание хода беседы.",
    messages,
    temperature: 0.3 // A bit more creative summarization
  });

  return response.content || "";
};
