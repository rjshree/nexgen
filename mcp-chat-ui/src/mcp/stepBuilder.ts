
import { AgentStep } from "./execution";
import { MCPIntent } from "./types";
import { resolveGenerationType } from "./generationType"; 

export function buildExecutionSteps(
  intent: MCPIntent
): AgentStep[] {
  const steps: AgentStep[] = [
    { id: "resolve_intent", label: "resolve_intent", status: "done" },
    {
      id: "decide_generation_type",
      label: "decide_generation_type",
      status: "done",
    },
  ];

  const generationType = resolveGenerationType(intent);

  if (generationType === "project") {
    steps.push({
      id: "collect_project_info",
      label: "collect_project_info",
      status: "running",
    });
  }

  if (generationType === "schema") {
    steps.push({
      id: "collect_schema",
      label: "collect_schema",
      status: "running",
    });
  }

  steps.push({
    id: "run_generator",
    label: "run_generator",
    status: "pending",
  });

  return steps;
}