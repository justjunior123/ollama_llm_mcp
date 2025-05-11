import { Tool } from "./toolInterfaces";

export const weatherTool: Tool = {
  name: "get_weather",
  description: "Get the current weather for a location",
  schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state, e.g., San Francisco, CA",
      }
    },
    required: ["location"],
  },
  execute: async (args) => {
    const { location } = args;
    // In a real implementation, you would call a weather API here
    return {
      temperature: "72°F",
      conditions: "Sunny",
      location: location,
    };
  }
};