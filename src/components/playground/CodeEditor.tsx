"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";

/**
 * The code box.
 *
 * Monaco (the editor from VS Code) is loaded lazily and only on this route, and
 * until it arrives the same value is edited in a plain textarea. That ordering
 * is deliberate: a student can start typing immediately instead of watching a
 * spinner, and if Monaco never loads — blocked CDN, offline lab machine — the
 * textarea is still a working editor rather than a broken page.
 */
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => null,
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Monaco language id — "python", "cpp", … */
  language: string;
  onRun?: () => void;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  onRun,
  className,
}: CodeEditorProps) {
  // Once Monaco is mounted the textarea is removed rather than left underneath:
  // two editors for one value would both be in the tab order and both announced
  // by a screen reader.
  const [monacoReady, setMonacoReady] = useState(false);

  /** Tab inserts two spaces instead of leaving the editor, which is what a
   *  code box has to do; Ctrl/Cmd+Enter runs. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onRun?.();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const target = event.currentTarget;
      const { selectionStart, selectionEnd } = target;
      const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
      onChange(next);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = selectionStart + 2;
      });
    }
  }

  return (
    <div
      className={cn(
        "relative h-[26rem] overflow-hidden rounded-card border border-line bg-surface",
        className,
      )}
    >
      {/* The fallback. Editable from the first paint, replaced when Monaco
          finishes loading — and kept forever if it never does. */}
      {!monacoReady && (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        aria-label="Code editor"
        className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-ink focus:outline-none"
      />
      )}

      <div className={cn("absolute inset-0", !monacoReady && "invisible")}>
        <MonacoEditor
          height="100%"
          language={language}
          value={value}
          onChange={(next) => onChange(next ?? "")}
          theme="vs"
          onMount={(editor, monaco) => {
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => onRun?.(),
            );
            setMonacoReady(true);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
