import { z } from "zod";
import { resetDb } from "../memory.js";

export const resetMemoryToolDefinition = {
  name: "ResetMemory",
  parameters: z.object({}),
  description:
    "Сбросить память о предыдущих взаимодействиях. Используйте это, чтобы очистить память и разговор начать заново."
};

export const resetMemory = async ({ toolArgs }) => {
  await resetDb();
  return undefined;
};
