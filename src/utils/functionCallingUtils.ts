import { Tool } from "../tools/toolInterfaces";

export function createSystemPrompt(tools: Tool[]) {
  const toolDefinitions = tools.map(tool => {
    return `
    Function Name: ${tool.name}
    Description: ${tool.description}
    Parameters: ${JSON.stringify(tool.schema, null, 2)}
    `;
  }).join("\n\n");

  return `You are an AI assistant with access to the following functions:

    ${toolDefinitions}

    When you need to use a function, respond with JSON in the following format:
    {"function_call": {"name": "function_name", "arguments": {"arg1": "value1", "arg2": "value2"}}}

    Otherwise, respond normally.`;
}

export function parseFunctionCall(text: string) {
  try {
    // Extract JSON from the response if it's in the expected format
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.function_call && parsed.function_call.name) {
      return {
        name: parsed.function_call.name,
        arguments: parsed.function_call.arguments,
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to parse function call:", e);
    console.log("Prase:", text);
    return null;
  }
}