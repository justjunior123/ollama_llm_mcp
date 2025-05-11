export interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}