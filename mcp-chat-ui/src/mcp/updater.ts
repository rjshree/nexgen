// src/mcp/updater.ts

import { GenerationMode, MCPConversationState } from "./types";
import { resolveIntent } from "./intentResolver";
import { AgentStep } from "./execution";
import { buildExecutionSteps } from "./stepBuilder";

import { extractProjectName } from "./contextExtractor";

import { parseUserInput } from "./inputParser";
import { nextSystemPrompt, SystemPrompt } from "./conversationRouter";





function buildStepsForIntent(mode: GenerationMode): AgentStep[] {
    switch (mode) {
        case "fs-sso":
          return [
            { id: "run_generator", label: "Generate UI", status: "pending" as const },
            { id: "run_api_generator", label: "Generate API", status: "pending" as const },
          ];
        case "fs-sso-crud":
          return [
            { id: "run_schema_generator", label: "Introspect DB Schema", status: "pending" as const },
            { id: "run_generator", label: "Generate UI", status: "pending" as const },
            { id: "run_api_generator", label: "Generate API", status: "pending" as const },
          ];
        case "schema-only":
          return [
            { id: "run_schema_generator", label: "Introspect DB Schema", status: "pending" as const },
          ];
        default:
          return [];
      }
}

// export function updateMCPStateOnUserMessage(
//     prevState: MCPConversationState,
//     message: string
// ): MCPConversationState {
//     const intent = resolveIntent(message);
//     const projectName = extractProjectName(message);

//     return {
        
//   ...prevState,
//   intent,
//   context: {
//     ...prevState.context,
//     ...(projectName && { projectName }),
//   },
//   execution: {
//     activeAgent: "orchestrator-agent",
//     steps: buildExecutionSteps(intent),
//   },
// };

//     };


export function updateMCPStateOnUserMessage(
    prev: MCPConversationState,
    message: string
  ): { state: MCPConversationState; systemPrompt?: SystemPrompt } {
    // 1. Parse user input into context updates
    const updates = parseUserInput(message, prev.context);
    console.log("Parsed user input into context updates:", updates);
    // 2. Apply updates to state
  const newContext = {
    ...prev.context,
    ...updates,
    db: updates.db
      ? { ...prev.context.db, ...updates.db }
      : prev.context.db,
  };

  // 3. Initialize steps when generation mode is first set
  const modeChanged = updates.generationMode && updates.generationMode !== prev.context.generationMode;
  const steps = modeChanged
    ? buildStepsForIntent(updates.generationMode!)
    : [...prev.execution.steps];

    const newState: MCPConversationState = {
      ...prev,
      context: {
        ...prev.context,
        ...updates,
        // Merge db fields if both exist
        db: updates.db
          ? { ...prev.context.db, ...updates.db }
          : prev.context.db,
      },
    };
    console.log("Updated conversation state with user input:", newState);
    // 3. Check if conversationRouter needs more info
    const prompt = nextSystemPrompt(newState);
  
    return {
      state: newState,
      systemPrompt: prompt ?? undefined,
    };
  }
  