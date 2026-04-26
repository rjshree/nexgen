import { MCPContext } from "./types";

/**
 * Try to parse JSON DB details from user message
 */
function tryParseDbJson(message: string): MCPContext["db"] | null {
  // Match JSON block (with or without markdown code fence)
  const jsonMatch = message.match(/```(?:json)?\s*([\s\S]*?)```/) || message.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    console.log("Parsed DB details:", parsed);
    if (parsed.host || parsed.schema || parsed.tableName) {
      return {
        type: parsed.type || "oracle",
        host: parsed.host,
        user: parsed.user,
        password: parsed.password,
        port: parsed.port ? Number(parsed.port) : undefined,
        schema: parsed.schema,
        serviceName: parsed.serviceName,
        tableName: parsed.tableName || parsed.table,
      };
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

/**
 * Parse user input into partial MCPContext updates
 */
export function parseUserInput(
  message: string,
  currentContext: MCPContext
): Partial<MCPContext> {
  const updates: Partial<MCPContext> = {};

  // 1. Try to detect generation mode (first message)
  if (!currentContext.generationMode || currentContext.generationMode === "none") {
    const lower = message.toLowerCase().trim();
    if (lower.includes("crud") || lower.includes("fs-sso-crud")) {
      updates.generationMode = "fs-sso-crud";
    } else if (lower.includes("schema")) {
      updates.generationMode = "schema-only";
    } else if (lower.includes("sso") || lower.includes("fs-sso")) {
      updates.generationMode = "fs-sso";
    } else if (lower.includes("quick-help") || lower.includes("help")) {
      updates.generationMode = "quick-help";
    }
    return updates;
  }

  // 2. If waiting for project name
  if (!currentContext.projectName) {
    const trimmed = message.trim();
    if (trimmed && !trimmed.includes("{") && !trimmed.includes(" ")) {
      updates.projectName = trimmed;
      return updates;
    }
  }

  // 3. If waiting for azure client id (fs-sso mode)
   // 3. If waiting for azure client id (fs-sso mode)
   if (currentContext.generationMode === "fs-sso" && currentContext.azureClientId === undefined) {
    const trimmed = message.trim();
    if (trimmed === "azure-no") {
      updates.azureClientId = "154d252a-9bcd-489c-b061-500ead6fd122";
      return updates;
    }
    if (trimmed === "azure-yes") {
      updates.azureClientId = "pending";
      return updates;
    }
    return updates;
  }

  // 3b. If azure choice was "yes", now waiting for actual client id
  if (currentContext.generationMode === "fs-sso" && currentContext.azureClientId === "pending") {
    const trimmed = message.trim();
    if (trimmed) {
      updates.azureClientId = trimmed;
      return updates;
    }
  }

  // 3c. Node modules install choice
  if (currentContext.generationMode === "fs-sso" && currentContext.installNodeModules === undefined) {
    const trimmed = message.trim();
    if (trimmed === "node-modules-yes") {
      updates.installNodeModules = true;
      return updates;
    }
    if (trimmed === "node-modules-no") {
      updates.installNodeModules = false;
      return updates;
    }
  }

  // 3d. Venv setup choice
  if (currentContext.generationMode === "fs-sso" && currentContext.setupVenv === undefined) {
    const trimmed = message.trim();
    if (trimmed === "venv-yes") {
      updates.setupVenv = true;
      return updates;
    }
    if (trimmed === "venv-no") {
      updates.setupVenv = false;
      return updates;
    }
  }

  // 3c. Node modules install choice
  if (currentContext.generationMode === "fs-sso-crud" && currentContext.installNodeModules === undefined) {
    const trimmed = message.trim();
    if (trimmed === "node-modules-yes") {
      updates.installNodeModules = true;
      return updates;
    }
    if (trimmed === "node-modules-no") {
      updates.installNodeModules = false;
      return updates;
    }
  }

  // 3d. Venv setup choice
  if (currentContext.generationMode === "fs-sso-crud" && currentContext.setupVenv === undefined) {
    const trimmed = message.trim();
    if (trimmed === "venv-yes") {
      updates.setupVenv = true;
      return updates;
    }
    if (trimmed === "venv-no") {
      updates.setupVenv = false;
      return updates;
    }
  }

 

  // 4. If waiting for DB details
  if (!currentContext.db?.host) {
    const dbParsed = tryParseDbJson(message);
    if (dbParsed) {
      updates.db = dbParsed;
      return updates;
    }
  }

  return updates;
}