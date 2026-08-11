import React from "react";

// Tiny zero-dependency markdown-lite renderer: headings, lists, fenced code,
// paragraphs, inline `code` and **bold**. Enough for catalog content.

function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-b-${idx}`} className="text-ink font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code key={`${keyBase}-c-${idx}`} className="rounded bg-bg border border-line px-1 py-0.5 text-[0.85em] font-mono">
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + token.length;
    idx++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ body }: { body: string }) {
  const lines = body.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre key={key++} className="rounded-xl bg-bg border border-line p-3 text-xs font-mono text-ink overflow-x-auto whitespace-pre">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++} className="text-ink font-semibold text-sm mt-4">{renderInline(line.slice(4), `h3-${key}`)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++} className="text-ink font-semibold text-base mt-5">{renderInline(line.slice(3), `h2-${key}`)}</h2>);
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1">
          {items.map((it, n) => (
            <li key={n}>{renderInline(it, `ul-${key}-${n}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-5 space-y-1">
          {items.map((it, n) => (
            <li key={n}>{renderInline(it, `ol-${key}-${n}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (gather until blank)
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^([-*]|\d+\.)\s/.test(lines[i]) && !lines[i].startsWith("#") && !lines[i].trim().startsWith("```")) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="leading-relaxed">
        {renderInline(para.join(" "), `p-${key}`)}
      </p>,
    );
  }

  return <div className="space-y-2 text-sm text-sub">{blocks}</div>;
}
