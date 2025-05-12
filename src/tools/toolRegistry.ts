import { Tool } from "./toolInterfaces";
import { weatherTool } from "./weatherTool";
import { webScrapeTool } from "./webScrapeTool";
import { bestCodeTool } from "./bestCodeTool";
import { filesystemTool } from "./filesystemTool";

// Add more tools as you build them
const availableTools: Tool[] = [weatherTool, webScrapeTool, bestCodeTool, filesystemTool] ;

export function getTools(): Tool[] {
  return availableTools;
}