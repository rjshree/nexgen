import { MCPIntent } from "./types";

export type GenerationType = "schema" | "project" | "unknown";

export function resolveGenerationType(
  intent: MCPIntent
): GenerationType {
  switch (intent) {
    case "collect_schema":
      return "schema";
    case "collect_project_info":
      return "project";
    default:
      return "unknown";
  }
}