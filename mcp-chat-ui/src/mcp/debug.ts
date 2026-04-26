// src/mcp/debug.ts

import { MCPConversationState } from "./types";

export function formatMCPState(state: MCPConversationState): string {
  return JSON.stringify(state, null, 2);
}
