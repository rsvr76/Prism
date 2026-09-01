# Prism

> See your code from every angle.

Prism takes a student's own Python implementation of a data structure or algorithm, runs it for real, and unfolds the execution step by step — variables, pointers, and structures changing in sync with the code — with an AI tutor that explains what happened, grounded in the actual execution trace.

Built for the [SPEED August AI Challenge](https://august-ai-challenge-31059.devpost.com/) (Devpost) 


## The Problem

Students can read DSA code line by line without ever building the mental model of what's actually happening to the data underneath it — how pointers move, how memory changes, how a structure reshapes itself. Most existing tools either animate a textbook algorithm the student didn't write, or let you step through arbitrary code with no real explanation of *why* something happened.

## What Prism does

- **Paste your own code** — not a preset example.
- **Real execution, not a canned animation** — a Python tracer captures the actual runtime state at every step.
- **Synced visualization** — a structural diagram (pointers, nodes, array cells) updates in lockstep with the highlighted line of code.
- **Step controls** — step forward/back, play/pause, jump to any step.
- **AI explanations grounded in the trace** — after each step, the AI explains the change using the real before/after state, not a generic description of the algorithm.

**Note on scope:** Prism currently supports Python only, and structure visualization (linked lists, trees) requires using the provided `Node`/`TreeNode` classes rather than arbitrary custom class shapes. We're not claiming to be the first tool that visualizes arbitrary code execution — that already exists (Python Tutor, others). What's ours is the AI-grounded explanation layer built on top of a real trace.

## How it works

```
Your code
   │
   ▼
Sandboxed execution (sys.settrace)
   │
   ▼
Canonical execution state (per step: line, variables, objects)
   │
   ├──▶ Structural renderer  ──▶ synced diagram + code highlight
   │
   └──▶ AI explanation layer ──▶ grounded step-by-step commentary
```

The AI never invents what happened — it explains the state the tracer actually captured.

## Tech stack

- **Tracer:** Python `sys.settrace` / `bdb`, sandboxed via restricted `exec()`
- **Frontend:** React + a code editor component, synced to the execution timeline
- **AI:** LLM call per step, prompted with the state diff (not the raw code alone)

## Getting started

```bash
# clone
git clone <repo-url>
cd unfold

# backend
cd backend && pip install -r requirements.txt

# frontend
cd frontend && npm install && npm run dev
```

*(Setup instructions will be finalized as the build progresses — this is a hackathon-in-progress repo.)*

## Demo

📹 *Demo video link — added at submission.*

## Limitations

- Python only for this hackathon build.
- Structure detection relies on provided boilerplate classes (`Node`, `TreeNode`), not open-ended inference over arbitrary class shapes.
- One visualization view per structure type — no switchable "views" in this version.

## What's next

- Multi-language support beyond Python
- Student-defined visualization templates
- "What if I changed this line?" — branching execution to compare a modified run against the original

## License

MIT
