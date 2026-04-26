import React, { useState, useEffect } from "react";
import "./App.css";

import { MCPConversationState } from "./mcp/types";
import { createInitialMCPState } from "./mcp/state";
import { updateMCPStateOnUserMessage } from "./mcp/updater";
import { formatMCPState } from "./mcp/debug";

import { nextSystemPrompt } from "./mcp/conversationRouter";
import { selectAgentSteps } from "./mcp/selectors";
import { AgentStepsPanel } from "./components/AgentStepsPanel";
import { runExecution } from "./mcp/runner";
import { renderMarkdown } from "./utils/markdownRenderer";

type ColumnInfo = {
  name: string;
  djangoField: string;
  djangoOptions: string;
  muiType: string;
  muiWidth: number;
};
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
type Message = {
  role: "user" | "system";
  text: string;
  choices?: { label: string; value: string }[];
  columns?: ColumnInfo[];
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);


  const [mcpState, setMcpState] = useState<MCPConversationState>(
    createInitialMCPState()
  );
  const steps = selectAgentSteps(mcpState);
  // Show welcome message on first load
  useEffect(() => {
    const welcome = nextSystemPrompt(mcpState);
    if (welcome) {
      setMessages([
        {
          role: "system",
          text: welcome.text,
          choices: welcome.choices,
        },
      ]);
    }
  }, []);
  const handleChoiceClick = (value: string) => {
    setInput(value);
    // Simulate sending the choice
    handleSend(value);
  };
  const handleSend = async (overrideInput?: string) => {
    const userInput = overrideInput || input;
    if (!userInput.trim()) return;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userInput },
      { role: "system", text: "⏳ Processing..." },
    ]);
    const startTime = Date.now();

    // 1. Update state with user input
    const { state: planned, systemPrompt } = updateMCPStateOnUserMessage(mcpState, userInput);

    // 2. If conversationRouter needs more info, show follow-up
    if (systemPrompt) {
      setMcpState(planned);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "system",
          text: systemPrompt.text,
          choices: systemPrompt.choices,
        },
      ]);
      return;
    }

    // 3. All info collected — run execution
    try {
      // Handle quick-help separately — no execution needed
      if (planned.context.generationMode === "quick-help") {
        try {
          const res = await fetch("/gettingStarted.md");
          const mdText = await res.text();
          const freshState = createInitialMCPState();
          setMcpState(freshState);
          const welcome = nextSystemPrompt(freshState);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "system", text: mdText, isMarkdown: true } as any,
            {
              role: "system",
              text: welcome?.text || "What would you like to do next?",
              choices: welcome?.choices,
            },
          ]);
        } catch {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "system", text: "❌ Could not load Getting Started guide." },
          ]);
        }
        return;
      }
      const newState = await runExecution(planned);
      setMcpState(newState);
      console.log("Execution completed with new state:", newState);

      const elapsedMs = Date.now() - startTime;
      const minutes = Math.floor(elapsedMs / 60000);
      const seconds = ((elapsedMs % 60000) / 1000).toFixed(2);
      const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      let outputMessage = "";

      if (newState.context.generationMode === "schema-only") {
        const result = newState.execution?.output?.result;
        if (result) {
          const columnsData = result.columns || [];
          outputMessage =
            `✅ Schema introspection complete!\n` +
            `📊 Table: ${result.table}\n` +
            `📋 Columns ${columnsData.length}\n` +
            `<!--COLUMNS_TABLE-->\n\n` +
            `🐍 Django Model:\n\`\`\`python\n${result.djangoModel}\n\`\`\`\n\n` +
            `⚛️ MUI DataGrid Columns:\n\`\`\`typescript\n${result.muiColumns}\n\`\`\`\n\n` +
            `⏱️ Time taken: ${timeFormatted}`;
          // Attach columns data to the message for table rendering
          const freshState = createInitialMCPState();
          setMcpState(freshState);
          const welcome = nextSystemPrompt(freshState);

          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              role: "system",
              text:
                `✅ Schema introspection complete!\n` +
                `📊 Table: ${result.table}\n` +
                `📋 Columns: ${columnsData.length}\n` +
                `<!--COLUMNS_TABLE-->`,
              columns: columnsData
            } as any,
            // Message 2: Django Model
            {
              role: "system",
              text:
                `🐍 Django Model:\n` +
                `\`\`\`python\n${result.djangoModel}\n\`\`\``,
            },
            // Message 3: MUI DataGrid Columns
            {
              role: "system",
              text:
                `⚛️ MUI DataGrid Columns:\n` +
                `\`\`\`json\n${result.muiColumns}\n\`\`\``,
            },
            {
              role: "system",
              text: welcome?.text || "What would you like to do next?",
              choices: welcome?.choices,
            },
          ]);
          return;
        } else {
          outputMessage = "❌ No schema output received.";
        }
      } else if (newState.context.generationMode === "fs-sso-crud") {
        const output = newState.execution?.output;
        const apiOut = newState.execution?.apiOutput;
        const devUrl = newState.execution?.devUrl;
        outputMessage = output
          ? `✅ ${output.message}\n📁 UI Root Folder: ${output.result.outputFolder}\n⏱️ Time taken: ${timeFormatted}`
          : "❌ No output received.";
        if (apiOut) {
          outputMessage += `\n\n🐍 API Generated!\n📁 API Root Fodler: ${apiOut.result.apiRoot}\n📂 Files:\n${apiOut.result.files.join("\n")}`;
        }
        if (devUrl) {
          outputMessage += `\n\n🚀 Dev server:  ${devUrl}`;
        }

      } else if (newState.context.generationMode === "fs-sso") {
        const output = newState.execution?.output;
        console.log("FS-SSO output:", newState);
        const apiOut = newState.execution?.apiOutput;
        const devUrl = newState.execution?.devUrl;
        outputMessage = output
          ? `✅ ${output.message}\n\n📁 UI Root Folder: ${output.result.outputFolder}`
          : "❌ No output received.";
        if (apiOut) {
          outputMessage += `\n\n🐍 API Generated!\n📁 API Root Fodler: ${apiOut.result.apiRoot}\n\n⏱️ Time taken: ${timeFormatted}`;
        }
        if (devUrl) {
          outputMessage += `\n\n🚀 Dev server:  ${devUrl}`;
        }
        if (newState.context.installNodeModules === false) {
          outputMessage += `\n\n⚠️ Note: \nNode modules were not installed. Run 'npm install' in your UI project folder before starting the UI dev server.` +
            `\n Install python dependencies with 'pip install -r requirements.txt' before starting the Django server.`;
        }
      } else {
        outputMessage = "❌ Unknown generation mode.";
      }
      // Reset state for next conversation
      const freshState = createInitialMCPState();
      setMcpState(freshState);

      // Show output + welcome message for next task
      const welcome = nextSystemPrompt(freshState);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "system", text: outputMessage },
        {
          role: "system",
          text: welcome?.text || "What would you like to do next?",
          choices: welcome?.choices,
        },
      ]);
    } catch (error: any) {
      const freshState = createInitialMCPState();
      setMcpState(freshState);
      const welcome = nextSystemPrompt(freshState);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "system", text: `❌ Execution failed: ${error.message}` },
        {
          role: "system",
          text: welcome?.text || "What would you like to do next?",
          choices: welcome?.choices,
        },
      ]);
    }
  };

  const sendMessage = async () => {
    await handleSend();
  };

  return (
    <div className="app-root">
      {/* Top Bar */}
      <header className="top-bar">
        <span
          style={{
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: 1000,
            fontSize: "26px",
            background: "linear-gradient(135deg, #58a6ff, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "2px",
            textTransform: "uppercase",
            // textShadow: "0 0 20px rgba(88, 166, 255, 0.5), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(236, 72, 153, 0.2)",
            filter: "drop-shadow(0 0 8px rgba(88, 166, 255, 0.6)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.4))",
            padding: "2px 8px",
            borderRadius: "4px",
            position: "relative" as const,
          }}
        >
          <span style={{
            position: "absolute" as const,
            inset: 0,
            background: "linear-gradient(135deg, rgba(88,166,255,0.15), rgba(168,85,247,0.1), rgba(236,72,153,0.15))",
            borderRadius: "2px",
            // zIndex: -1,
          }} />
          NexJen
        </span>

        <div className="top-actions">
          <span className="session-text">
            SESSION ID a3e0c9fb-b8d7-4b0f-8581-d1296d46dd01
          </span>
          <button className="ghost-btn">Token Streaming</button>
          <button className="primary-btn">+ New Session</button>
        </div>
      </header>

      {/* Main */}
      <div className="main">
        {/* Agent Steps Panel */}
        <aside className="agent-panel">
          <AgentStepsPanel steps={steps} />
        </aside>

        {/* Chat Panel */}
        <main className="chat-panel">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role === "user" ? "user-message" : "system-message"
                  }`}
              >
                {/* <button
                  style={{ position: "absolute", top: "4px", right: "6px", background: "transparent", color: "#999", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 4px" }}
                  onClick={() => {
                    navigator.clipboard.writeText(msg.text);
                    setCopiedIndex(idx * 10000);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                >
                  {copiedIndex === idx * 10000 ? "✅" : "📋"}
                </button> */}
                {(() => {
                  // If message is markdown (e.g. from gettingStarted.md), render with markdown parser
                  if ((msg as any).isMarkdown) {
                    return renderMarkdown(msg.text);
                  }
                  const blocks: React.ReactNode[] = [];
                  const lines = msg.text.split("\n");
                  let i = 0;
                  while (i < lines.length) {
                    const line = lines[i];
                    if (line.trim() === "<!--COLUMNS_TABLE-->" && msg.columns) {
                      blocks.push(
                        <table key={i} className="schema-table">
                          <thead>
                            <tr>
                              <th className="schema-th">#</th>
                              <th className="schema-th">DB Column</th>
                              <th className="schema-th">Django Field</th>
                              <th className="schema-th">Django Options</th>
                              <th className="schema-th">MUI Type</th>
                              <th className="schema-th">MUI Width</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.columns.map((col, ci) => (
                              <tr key={ci}>
                                <td className="schema-td">{ci + 1}</td>
                                <td className="schema-td">{col.name}</td>
                                <td className="schema-td">{col.djangoField}</td>
                                <td className="schema-td">{col.djangoOptions}</td>
                                <td className="schema-td">{col.muiType}</td>
                                <td className="schema-td">{col.muiWidth}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                      i++;
                    } else if (line.trim().startsWith("```")) {
                      const lang = line.trim().replace(/^```/, "").trim();
                      const codeLines: string[] = [];
                      i++;
                      while (i < lines.length && !lines[i].trim().startsWith("```")) {
                        codeLines.push(lines[i]);
                        i++;
                      }
                      i++; // skip closing ```
                      blocks.push(
                        <div key={`code-${i}`} style={{ position: "relative" }}>
                          <button
                            style={{ position: "absolute", top: "1px", right: "6px", background: "#333", color: "#ccc", border: "1px solid #555", borderRadius: "4px", padding: "2px 4px", cursor: "pointer", fontSize: "14px" }}
                            onClick={() => {
                              navigator.clipboard.writeText(codeLines.join("\n"));
                              setCopiedIndex(i + idx * 1000);
                              setTimeout(() => setCopiedIndex(null), 2000);
                            }}
                          >
                            {copiedIndex === i + idx * 1000 ? "✅ Copied" : "📋 Copy"}
                          </button>
                          <pre className="code-block" style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "12px", borderRadius: "6px", overflowX: "auto", fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre" }}>
                            {lang && <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>{lang}</div>}
                            <code>{codeLines.join("\n")}</code>
                          </pre>
                        </div>
                      );
                    } else {
                      // Render line with clickable URLs
                      const urlPattern = /(https?:\/\/[^\s]+)/g;
                      const parts = line.split(urlPattern);
                      blocks.push(
                        <React.Fragment key={i}>
                          {parts.map((part, pi) =>
                            /^https?:\/\//.test(part) ? (
                              <a key={pi} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#58a6ff", textDecoration: "underline" }}>
                                {part}
                              </a>
                            ) : (
                              <React.Fragment key={pi}>{part}</React.Fragment>
                            )
                          )}
                          <br />
                        </React.Fragment>
                      );
                      i++;
                    }
                  }
                  return blocks;
                })()}

                {msg.choices && (
                  <div style={{ marginTop: "10px" }}>
                  {msg.choices.some((c) => c.value !== c.label) ? (
                    // Clickable choice buttons
                    <div className="choices-container" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {msg.choices.map((choice, ci) => (
                        <button
                          key={ci}
                          className="choice-chip"
                          style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #555", background: "#2a2a2a", color: "#fff", cursor: "pointer" }}
                          onClick={() => handleChoiceClick(choice.value)}
                        >
                          {choice.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Non-clickable info block (e.g. DB format hint) with copy button
                    msg.choices.map((choice, ci) => (
                      <div key={ci} style={{ position: "relative", marginTop: "6px" }}>
                        <button
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            background: "#333",
                            color: "#ccc",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText(choice.label);
                            setCopiedIndex(idx * 10000 + ci);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                        >
                          {copiedIndex === idx * 10000 + ci ? "✅ Copied" : "📋 Copy"}
                        </button>
                        <pre
                          style={{
                            backgroundColor: "#1e1e1e",
                            color: "#d4d4d4",
                            padding: "12px",
                            paddingRight: "80px",
                            borderRadius: "6px",
                            overflowX: "auto",
                            fontFamily: "monospace",
                            fontSize: "13px",
                            whiteSpace: "pre",
                            margin: "0",
                          }}
                        >
                          <code>{choice.label}</code>
                        </pre>
                      </div>
                    ))
                  )}
                </div>
                )}


              </div>
            ))}
          </div>

          <div className="input-bar">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button className="send-button" onClick={sendMessage}>
              ➤
            </button>
          </div>

          {/* Debug only */}
          {/* <pre className="debug-panel" style={{ marginTop: "20px", backgroundColor: "#f0f0f0", color: "black", padding: "10px", borderRadius: "5px", maxHeight: "200px", overflowY: "scroll" }}>
            {formatMCPState(mcpState)}
          </pre> */}

        </main>
      </div>
    </div>
  );
}

