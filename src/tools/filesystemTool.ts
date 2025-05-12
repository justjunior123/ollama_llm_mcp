import { url } from "inspector";
import { Tool } from "./toolInterfaces";
import axios from 'axios';

export const filesystemTool: Tool = {
  name: "filesystem_tool",
  description: "Interact with the /mcp endpoint of the filesystem server",
  schema: {
    type: "object",
    properties: {
      payload: {
        type: "object",
        description: "The data to send in the request body",
      }
    },
    required: ["payload"],
  },
  execute: async (args) => {
    try {
      const response = await axios.post('http://localhost:3000/mcp', args.payload, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error interacting with /mcp endpoint:', error);
      throw error;
    }
  }
};