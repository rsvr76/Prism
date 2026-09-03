"use client";

import React, { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useExecutionStore } from "@/store/useExecutionStore";

export default function CodeEditor() {
  const code = useExecutionStore((state) => state.code);
  const setCode = useExecutionStore((state) => state.setCode);
  const currentStep = useExecutionStore((state) => state.currentStep);
  const trace = useExecutionStore((state) => state.trace);

  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Sync active line highlighting with currentStep
  useEffect(() => {
    if (!editorRef.current || !trace || !trace.frames || trace.frames.length === 0) {
      if (editorRef.current && decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    const currentFrame = trace.frames[currentStep];
    if (!currentFrame || !currentFrame.line) return;

    const line = currentFrame.line;

    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "prism-active-line-highlight",
          glyphMarginClassName: "prism-active-glyph-arrow",
        },
      },
    ]);

    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  }, [currentStep, trace]);

  const currentFrame = trace?.frames?.[currentStep];

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0f1d] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/70 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-slate-200">Python 3.12 Editor</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          {currentFrame?.line ? (
            <span className="text-cyan-400 font-medium">Executing Line {currentFrame.line}</span>
          ) : (
            <span>Ready</span>
          )}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            lineHeight: 22,
            lineNumbers: "on",
            glyphMargin: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            renderLineHighlight: "all",
          }}
        />
      </div>
    </div>
  );
}
