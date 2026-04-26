import React from "react";

export function renderMarkdown(text: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith("```")) {
      const lang = line.trim().replace(/^```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <pre
          key={`code-${i}`}
          style={{
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            padding: "12px",
            borderRadius: "6px",
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: "13px",
            whiteSpace: "pre",
            margin: "8px 0",
          }}
        >
          {lang && (
            <div style={{ color: "#888", fontSize: "11px", marginBottom: "4px" }}>
              {lang}
            </div>
          )}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Table: detect header row with `|`
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableRows: string[][] = [];
      let hasHeader = false;

      // Collect all table rows
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const row = lines[i]
          .trim()
          .slice(1, -1) // remove leading/trailing |
          .split("|")
          .map((cell) => cell.trim());

        // Skip separator row (e.g., |---|---|)
        if (row.every((cell) => /^[-:\s]+$/.test(cell))) {
          hasHeader = true;
          i++;
          continue;
        }
        tableRows.push(row);
        i++;
      }

      const headerRow = hasHeader ? tableRows[0] : null;
      const bodyRows = hasHeader ? tableRows.slice(1) : tableRows;

      blocks.push(
        <div
          key={`table-${i}`}
          style={{
            overflowX: "auto",
            margin: "10px 0",
            maxWidth: "100%",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              tableLayout: "fixed",
              wordWrap: "break-word",
            }}
          >
            {headerRow && (
              <thead>
                <tr>
                  {headerRow.map((cell, ci) => (
                    <th
                      key={ci}
                      style={{
                        border: "1px solid #444",
                        padding: "8px 10px",
                        backgroundColor: "#2a2a2a",
                        color: "#e0e0e0",
                        textAlign: "left",
                        fontWeight: 600,
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      style={{
                        border: "1px solid #444",
                        padding: "8px 10px",
                        color: "#ccc",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                        lineHeight: "1.5",
                        verticalAlign: "top",
                      }}
                    >
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const sizes: Record<number, string> = { 1: "22px", 2: "18px", 3: "15px", 4: "13px" };
      blocks.push(
        <div
          key={`h-${i}`}
          style={{
            fontSize: sizes[level] || "14px",
            fontWeight: 700,
            margin: "14px 0 6px",
            color: "#fff",
            borderBottom: level <= 2 ? "1px solid #444" : undefined,
            paddingBottom: level <= 2 ? "4px" : undefined,
          }}
        >
          {renderInlineMarkdown(content)}
        </div>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(
        <hr key={`hr-${i}`} style={{ border: "none", borderTop: "1px solid #444", margin: "12px 0" }} />
      );
      i++;
      continue;
    }

    // Unordered list items
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} style={{ margin: "6px 0", paddingLeft: "20px", color: "#ccc" }}>
          {items.map((item, li) => (
            <li key={li} style={{ marginBottom: "4px", wordBreak: "break-word" }}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular text with URLs
    blocks.push(
      <p key={`p-${i}`} style={{ margin: "4px 0", color: "#ccc", wordBreak: "break-word", lineHeight: "1.5" }}>
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return blocks;
}

/** Render inline markdown: bold, code, links, URLs */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split by inline code, bold, and URLs
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g;
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code
          key={i}
          style={{
            backgroundColor: "#333",
            color: "#f0c040",
            padding: "1px 5px",
            borderRadius: "3px",
            fontSize: "12px",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={i} style={{ color: "#e0e0e0" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "#58a6ff", textDecoration: "underline", wordBreak: "break-all" }}>
          {part}
        </a>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}