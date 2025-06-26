export const createToolCallMessage = toolName => ({
  role: "assistant",
  tool_calls: [
    {
      type: "function",
      function: { name: toolName }
    }
  ]
});
