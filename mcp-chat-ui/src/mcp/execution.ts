
// src/mcp/execution.ts

export type ExecutionStatus = "pending" | "running" | "done";

export type AgentStep = {
  id: string;
  label: string;
  status: ExecutionStatus;
};

export type MCPExecutionState = {
  steps: AgentStep[];
  output?: any;
  schemaOutput?: any;
  uiOutput?: any;
  apiOutput?: any;
  devUrl?: any;
  

};
