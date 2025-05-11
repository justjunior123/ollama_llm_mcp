import { Tool } from "./toolInterfaces";
import { weatherTool } from "./weatherTool";

// Add more tools as you build them
const availableTools: Tool[] = [weatherTool];

export function getTools(): Tool[] {
  return availableTools;
}