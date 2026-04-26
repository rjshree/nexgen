// src/mcp/intentResolver.ts

import { MCPConversationState, MCPIntent, GenerationMode } from "./types";

const MODE_KEYWORDS: Record<string, GenerationMode> = {
  "fs-sso-crud": "fs-sso-crud",
  "crud": "fs-sso-crud",
  "schema": "schema-only",
  "fs-sso": "fs-sso",
  "sso": "fs-sso",
};

export function resolveGenerationMode(message: string): GenerationMode | undefined {
  const lower = message.toLowerCase().trim();
  for (const [keyword, mode] of Object.entries(MODE_KEYWORDS)) {
    if (lower.includes(keyword)) return mode;
  }
  return undefined;
}

export function resolveIntent(state: MCPConversationState): MCPIntent {
  const { context } = state;

  if (!context.generationMode || context.generationMode === "none") {
    return "collect_project_info";
  }

  switch (context.generationMode) {
    case "fs-sso":
      if (!context.projectName) return "collect_project_info";
      if (!context.azureClientId) return "collect_azure_credentials";
      return "unknown"; // ready to execute

    case "fs-sso-crud":
      if (!context.projectName) return "collect_project_info";
      if (!context.db?.host) return "collect_schema";
      return "unknown"; // ready to execute

    case "schema-only":
      if (!context.db?.host) return "collect_schema";
      return "unknown"; // ready to execute

    default:
      return "unknown";
  }
}
