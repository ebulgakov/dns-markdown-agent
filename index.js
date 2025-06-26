import "dotenv/config";
import { runAgent } from "./src/agent.js";

const userMessage = process.argv[2];

if (!userMessage) {
  console.error("Please provide a message");
  process.exit(1);
}

await runAgent({ userMessage, tools: [] });
