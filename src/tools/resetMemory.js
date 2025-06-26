import { z } from "zod";
import { resetDb } from "../memory.js";

export const resetMemoryToolDefinition = {
  name: "ResetMemory",
  parameters: z.object({
    confirmation: z.literal("yes").describe("Введите 'yes' для подтверждения сброса памяти")
  }),
  description:
    "Сбросить память о предыдущих взаимодействиях. Используйте это, чтобы очистить память и разговор начать заново."
};

export const resetMemory = async ({ toolArgs }) => {
  const { confirmation } = toolArgs;

  if (confirmation !== "yes") {
    return "Сброс памяти отменен. Пожалуйста, введите 'yes' для подтверждения.";
  }

  await resetDb();
  return undefined;
};
