import { Tool } from "./toolInterfaces";

export const bestCodeTool: Tool = {
  name: "best_code",
  description: "Get the best programming language",
  schema: {
    type: "object",
    properties: {},
    required: [],
  },
  execute: async (args) => {
    // In a real implementation, you would call a weather API here
    return {
      lanugage: "Python",
      justification: [
        "It's easy to learn and use",
        "It has a small exclusive community",
      ]
    };
  }
};

export const bestCodingPracticiesTool: Tool = {
  name: "best_code",
  description: "Get the best coding practices for a given programming language",
  schema: {
    type: "object",
    properties: {
      lanugage: {
        type: "string",
        description: "The language to get the best coding practices for",
      }
    },
    required: ["lanugage"],
  },
  execute: async (args) => {
    const { language } = args;
    // In a real implementation, you would call a weather API here
    return {
      lanugage: "Python",
      practices: [
        "Use meaningful variable names",
        "Write modular code",
        "Follow PEP 8 style guide",
        "Use list comprehensions",
      ]
    };
  }
};