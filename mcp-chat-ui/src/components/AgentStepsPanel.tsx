import { AgentStep } from "../mcp/execution";
import "./AgentStepsPanel.css";

type Props = {
  steps: AgentStep[];
};

export function AgentStepsPanel({ steps }: Props) {
  return (
    <aside className="agent-panel">
      {steps.map((step) => (
        <div key={step.id} className={`agent-step ${step.status}`}>
          <span className="dot" />
          {step.label}
        </div>
      ))}
    </aside>
  );
}