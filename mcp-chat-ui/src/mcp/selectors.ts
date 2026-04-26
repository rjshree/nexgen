
// src/mcp/selectors.ts
import { MCPConversationState } from "./types";
import { AgentStep } from "./execution";

export function selectAgentSteps(
  state: MCPConversationState
): AgentStep[] {
  return state.execution.steps;
}
