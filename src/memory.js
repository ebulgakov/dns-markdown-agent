import { JSONFilePreset } from "lowdb/node";
import { v4 as uuidv4 } from "uuid";
import { summarizeMessages } from "./llm.js";

export const addMetadata = message => {
  return {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
};

export const removeMetadata = message => {
  const { id, createdAt, ...rest } = message;
  return rest;
};

const defaultData = {
  messages: [],
  summary: ""
};

export const resetDb = async () => {
  const db = await getDb();
  db.data = { ...defaultData };
  await db.write();
};

export const getDb = async () => {
  const db = await JSONFilePreset("db.json", defaultData);
  return db;
};

export const getSummary = async () => {
  const db = await getDb();
  return db.data.summary;
};

export const addMessages = async messages => {
  const db = await getDb();
  db.data.messages.push(...messages.map(addMetadata));

  if (db.data.messages.length >= 10) {
    const oldestMessages = db.data.messages.slice(0, 5).map(removeMetadata);
    db.data.summary = await summarizeMessages(oldestMessages);
  }

  await db.write();
};

export const getMessages = async () => {
  const db = await getDb();
  const messages = db.data.messages.map(removeMetadata);
  const lastFive = messages.slice(-5);

  // If first message is a tool response, get one more message before it. Needed for correct context in LLM.
  if (lastFive[0]?.role === "tool") {
    const sixthMessage = messages[messages.length - 6];
    if (sixthMessage) {
      return [...[sixthMessage], ...lastFive];
    }
  }

  return lastFive;
};

export const saveToolResponse = async (toolCallId, toolResponse) => {
  return addMessages([
    {
      role: "tool",
      content: toolResponse,
      tool_call_id: toolCallId
    }
  ]);
};
