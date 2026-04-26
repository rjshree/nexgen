import { MCPConversationState, GenerationMode } from "./types";

export type SystemPrompt = {
  text: string;
  choices?: { label: string; value: string }[];
};

/**
 * Returns the next system prompt if more info is needed.
 * Returns null when all info is collected and ready to execute.
 */
export function nextSystemPrompt(
  state: MCPConversationState
): SystemPrompt | null {
  const ctx = state.context;

  // Step 1: No mode selected yet
  if (!ctx.generationMode || ctx.generationMode === "none") {
    return {
      text: "Welcome! What would you like to generate? \n Please click one of the options below to get started.",
      choices: [
        { label: "🖥️ Next.js UI + Django API with SSO", value: "fs-sso" },
        { label: "📦 Full CRUD from existing DB table", value: "fs-sso-crud" },
        { label: "🗃️ Generate model/columns from DB schema", value: "schema-only" },
        { label: "❓ Quick Help — Getting Started", value: "quick-help" },
      ],
    };
  }

  // Step 2: Mode-specific prompts
  if (ctx.generationMode === "fs-sso") {
    if (!ctx.projectName) return { text: "Please provide the project name." };
    if (ctx.azureClientId === undefined) {
      return {
        text: "Do you have an Azure Client ID?",
        choices: [
          { label: "✅ Yes, I have one", value: "azure-yes" },
          { label: "❌ No, use default", value: "azure-no" },
        ],
      };
    }
    if (ctx.azureClientId === "pending") {
      return { text: "Please provide the Azure Client ID." };
    }
    if (ctx.installNodeModules === undefined) {
      return {
        text: "Do you want node_modules installed?",
        choices: [
          { label: "✅ Yes", value: "node-modules-yes" },
          { label: "❌ No", value: "node-modules-no" },
        ],
      };
    }
    if (ctx.setupVenv === undefined) {
      return {
        text: "Do you want to setup venv for Django project?",
        choices: [
          { label: "✅ Yes", value: "venv-yes" },
          { label: "❌ No", value: "venv-no" },
        ],
      };
    }
    return null;
  }

  if (ctx.generationMode === "fs-sso-crud") {
    if (!ctx.projectName) return { text: "Please provide the project name." };
    if (ctx.installNodeModules === undefined) {
      return {
        text: "Do you want node_modules installed?",
        choices: [
          { label: "✅ Yes", value: "node-modules-yes" },
          { label: "❌ No", value: "node-modules-no" },
        ],
      };
    }
    if (ctx.setupVenv === undefined) {
      return {
        text: "Do you want to setup venv for Django project?",
        choices: [
          { label: "✅ Yes", value: "venv-yes" },
          { label: "❌ No", value: "venv-no" },
        ],
      };
    }
    if (!ctx.db?.host || !ctx.db?.schema || !ctx.db?.user || !ctx.db?.password || !ctx.db?.tableName) {
      const dbFormat =
        '{\n' +
        '  "type": "",\n' +
        '  "host": "",\n' +
        '  "schema": "",\n' +
        '  "user": "",\n' +
        '  "password": "",\n' +
        '  "port": 1521,\n' +
        '  "serviceName": "",\n' +
        '  "tableName": ""\n' +
        '}';
      return {
        text: "Please provide valid DB details in the below format:\n",
        choices: [
          {
            label: dbFormat,
            value: dbFormat,
          },
        ],
      };
    }
    return null;
  }

  if (ctx.generationMode === "schema-only") {
    if (!ctx.db?.host || !ctx.db?.schema || !ctx.db?.user || !ctx.db?.password || !ctx.db?.tableName) {
      const dbFormat =
        '{\n' +
        '  "type": "",\n' +
        '  "host": "",\n' +
        '  "schema": "",\n' +
        '  "user": "",\n' +
        '  "password": "",\n' +
        '  "port": 1521,\n' +
        '  "serviceName": "",\n' +
        '  "tableName": ""\n' +
        '}';
      return {
        text: "Please provide valid DB details in the below format:\n",
        choices: [
          {
            label: dbFormat,
            value: dbFormat,  // same value = label → renders as info block
          },
        ],
      };
    }
    return null;
  }

  return null;
}