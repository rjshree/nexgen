// src/mcp/types.ts
import { MCPExecutionState } from "./execution";



export type GenerationMode =
  | "none"
  | "fs-sso"
  | "fs-sso-crud"
  | "schema-only"
  | "quick-help";

export type MCPIntent =
  | "collect_project_info"
  | "collect_azure_credentials"
  | "collect_schema"
  | "unknown";

export type MCPContext = {
  generationMode?: GenerationMode;
  projectName?: string;
  azureClientId?: string;
  installNodeModules?: boolean;
  setupVenv?: boolean;

  db?: {
    type?: "oracle" | "mariadb";
    host?: string;
    user?: string;    
    password?: string;
    port?: number;
    schema?: string;
    serviceName?: string;
    tableName?: string;
  };
  

};

export type MCPExecution = {
  activeAgent?: string;
  lastAction?: string;
};

export type MCPConversationState = {
  intent: string;
  context: MCPContext;
  execution: MCPExecutionState;
};
