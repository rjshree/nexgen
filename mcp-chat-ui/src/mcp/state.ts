// src/mcp/state.ts

import { MCPConversationState } from "./types";

export function createInitialMCPState(): MCPConversationState {
    return {
        intent: "unknown",
        context: {},

        execution: {
            steps: [],
        },

    };
}
