"use client";

import React, { useEffect, useState } from "react";

type Node = {
  left: number;
  top: number;
  txStart: string;
  tyStart: string;
  txEnd: string;
  tyEnd: string;
  duration: string;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function FloatingGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    setNodes(
      Array.from({ length: 15 }, () => ({
        left: rand(2, 96),
        top: rand(6, 90),
        txStart: `${rand(-24, 24)}px`,
        tyStart: `${rand(-18, 18)}px`,
        txEnd: `${rand(-30, 30)}px`,
        tyEnd: `${rand(-26, 26)}px`,
        duration: `${rand(9, 18).toFixed(1)}s`,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full">
        {nodes.slice(0, 10).map((n, i) => {
          const m = nodes[(i + 3) % nodes.length];
          if (!m) return null;
          return (
            <line
              key={i}
              x1={`${n.left}%`}
              y1={`${n.top}%`}
              x2={`${m.left}%`}
              y2={`${m.top}%`}
              stroke="currentColor"
              className="text-purple-500/20 dark:text-cyan-400/20"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      {nodes.map((n, i) => (
        <span
          key={i}
          className="graph-node"
          style={
            {
              left: `${n.left}%`,
              top: `${n.top}%`,
              "--tx-start": n.txStart,
              "--ty-start": n.tyStart,
              "--tx-end": n.txEnd,
              "--ty-end": n.tyEnd,
              "--duration": n.duration,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default FloatingGraph;
