import { Tool } from "../tools/toolInterfaces";

export async function handleFunctionCall(
  functionName: string,
  args: any,
  tools: Tool[]
) {
  const tool = tools.find(t => t.name === functionName);
  if (!tool) {
    throw new Error(`Function ${functionName} not found`);
  }
  
  try {
    const result = await tool.execute(args);
    return result;
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    throw error;
  }
}