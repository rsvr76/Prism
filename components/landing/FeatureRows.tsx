"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { LinkedListAnim } from "./animations/LinkedListAnim";

const STEPS = [
  {
    code: "def insert(head, val):",
    locals: [["head", "node(1)"], ["val", "7"]],
    heap: "3 nodes live @0x7f2a",
    heapTone: "muted",
    note: "call frame created",
  },
  {
    code: "    curr = head",
    locals: [["curr", "node(1)"], ["val", "7"]],
    heap: "no allocation",
    heapTone: "muted",
    note: "curr now points at the head",
  },
  {
    code: "    while curr.next:",
    locals: [["curr", "node(1)"], ["curr.next", "node(2)"]],
    heap: "no allocation",
    heapTone: "muted",
    note: "condition is True, enter loop",
  },
  {
    code: "        curr = curr.next",
    locals: [["curr", "node(2)"], ["curr.next", "node(3)"]],
    heap: "no allocation",
    heapTone: "amber",
    note: "curr walked one node forward",
  },
  {
    code: "    curr.next = Node(val)",
    locals: [["curr", "node(3)"], ["curr.next", "node(7)"]],
    heap: "+ Node(7) @0x7f2a",
    heapTone: "emerald",
    note: "new node allocated and linked",
  },
  {
    code: "    return head",
    locals: [["head", "node(1)"], ["length", "4"]],
    heap: "4 nodes live",
    heapTone: "emerald",
    note: "list returned with 4 nodes",
  },
];

function WorkbenchMock() {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLine((l) => (l + 1) % STEPS.length), 1200);
    return () => clearInterval(id);
  }, []);

  const step = STEPS[line]!;
  const heapClass =
    step.heapTone === "emerald"
      ? "text-emerald-500 font-semibold"
      : step.heapTone === "amber"
        ? "text-amber-500 font-semibold"
        : "text-slate-500 dark:text-slate-400";

  return (
    <div className="glass-card h-[300px] overflow-hidden p-0" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="size-2.5 rounded-full bg-rose-500" />
        <span className="size-2.5 rounded-full bg-amber-500" />
        <span className="size-2.5 rounded-full bg-emerald-500" />
        <span className="ml-2 font-medium">workbench · linked_list.py</span>
      </div>
      <div className="grid h-[calc(300px-42px)] grid-cols-[1.4fr_1fr]">
        <pre className="overflow-hidden border-r border-slate-200 dark:border-slate-800 p-3 font-mono text-[11px] leading-6 bg-slate-50/30 dark:bg-slate-950/40">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`-mx-1 rounded px-1.5 transition-colors ${
                i === line
                  ? "bg-purple-500/20 text-purple-700 dark:text-cyan-300 font-semibold"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <span className="mr-2 text-slate-400 dark:text-slate-500">{i + 1}</span>
              <span className="mr-1 text-purple-600 dark:text-cyan-400">{i === line ? "►" : " "}</span>
              {s.code}
            </div>
          ))}
        </pre>
        <div className="space-y-1.5 p-3 font-mono text-[11px]">
          <p className="text-slate-400 dark:text-slate-500 font-semibold">locals</p>
          {step.locals.map(([k, v]) => (
            <p key={k} className="new-node text-purple-700 dark:text-cyan-400">
              {k} → <span className="text-slate-800 dark:text-slate-200">{v}</span>
            </p>
          ))}
          <p className="pt-2 text-slate-400 dark:text-slate-500 font-semibold">heap delta</p>
          <p key={step.heap} className={`new-node ${heapClass}`}>
            {step.heap}
          </p>
          <p className="pt-2 text-slate-500 dark:text-slate-400">{step.note}</p>
        </div>
      </div>
    </div>
  );
}

function TutorMock() {
  return (
    <div className="glass-card flex h-[300px] flex-col justify-between gap-3 p-5" aria-hidden="true">
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200">
        Why did head.next change at step 12?
      </div>
      <div className="max-w-[95%] rounded-2xl rounded-bl-sm border border-purple-500/25 bg-purple-500/10 dark:bg-purple-900/20 px-4 py-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        <p className="mb-1 font-mono text-[11px] text-purple-600 dark:text-cyan-400 font-bold">Prism AI Tutor</p>
        At step 12, <span className="font-mono font-semibold text-purple-700 dark:text-cyan-300">insert(7)</span> ran line 14:{" "}
        <span className="font-mono text-purple-700 dark:text-cyan-300">curr.next = Node(7)</span>. The heap allocated a new
        node at this address and re-wired the pointer from node(3).
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Check className="size-3" /> Ground-Truth Observed
          </span>
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  {
    visual: <WorkbenchMock />,
    title: "Write. Run. Inspect.",
    body: "The workbench shows your code, its execution trace, and heap memory state — all strictly synchronized to the same step.",
  },
  {
    visual: <LinkedListAnim />,
    title: "See Every Pointer Move.",
    body: "Arrays, linked lists, and binary search trees render directly from your actual heap — not idealized or pre-drawn pictures.",
  },
  {
    visual: <TutorMock />,
    title: "An AI That Cannot Hallucinate.",
    body: "Every step explanation and tutor answer is grounded in your actual trace diff. Prism reads the execution truth before explaining.",
  },
];

export function FeatureRows() {
  return (
    <section className="mx-auto max-w-6xl space-y-16 md:space-y-24 px-5 py-10">
      {ROWS.map((row, i) => (
        <div
          key={row.title}
          className="reveal grid items-center gap-8 md:grid-cols-2 md:gap-12"
        >
          <div className={i % 2 === 1 ? "md:order-2" : ""}>{row.visual}</div>
          <div className={i % 2 === 1 ? "md:order-1" : ""}>
            <h3 className="text-section font-bold text-slate-900 dark:text-white">{row.title}</h3>
            <p className="mt-4 max-w-md leading-relaxed text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              {row.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default FeatureRows;
