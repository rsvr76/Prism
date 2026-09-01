
# Prism

> **See your code from every angle.**

Prism is an AI-powered visual learning tool for **Data Structures and Algorithms (DSA)**.

Paste your own Python implementation, run it for real, and watch the execution unfold step by step. Prism synchronizes the source code with visual changes to variables, pointers, and data structures, while an AI tutor explains what happened using the actual execution trace.



## Table of Contents

- [The Problem](#the-problem)
- [What Prism Does](#what-prism-does)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Current Scope](#current-scope)
- [Limitations](#limitations)
- [Future Roadmap](#future-roadmap)
- [Built For](#built-for)



## The Problem

Students can read DSA code line by line without building a clear mental model of what is happening underneath:

- How **pointers** move
- How **variables** change
- How **data structures** evolve
- **Why** a particular line executes
- **What changes** after each operation

Existing tools often provide predefined visualizations or execution debugging **without** contextual learning support.



## What Prism Does

| Feature | Description |
|---|---|
| **Use Your Own Code** | Paste your own implementation instead of preset examples |
| **Real Execution** | Execute code for real and capture the runtime state |
| **Visualize Execution** | See structures, variables, pointers, and arrays come alive |
| **Code-Visual Sync** | Synchronize code and visuals at every execution step |
| **Step Controls** | Play, pause, next, previous, and timeline navigation |
| **AI Tutor** | Ask *why* something happened at any step |
| **Trace-Grounded AI** | Explanations are grounded in the real execution trace — no guessing |



## How It Works

```
Your Python Code
       ↓
Sandboxed Execution
       ↓
Execution Trace
       ↓
 ┌────┴─────┐
 ↓            ↓
Visual      AI Tutor
Model       Explanation
 ↓             ↓
 └─────┬─────┘
        ↓
Student Understanding
```



## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python |
| **Tracing** | `sys.settrace` / `bdb` |
| **Frontend** | React |
| **Visualization** | Interactive data-structure rendering |
| **AI** | LLM API with execution-trace context |



## Current Scope

**Language:**
- Python only

**Data Structures:**
- Arrays
- Linked Lists
- Stacks
- Queues
- Binary Trees

**Algorithms:**
- Basic searching
- Sorting
- Traversal
- Recursion



## Limitations

- Structure visualization currently relies on supported `Node` / `TreeNode` classes rather than arbitrary custom class shapes.
- This is a **hackathon prototype** and not a production-grade arbitrary-code execution environment.



## Future Roadmap

- [ ] Multiple visualization perspectives
- [ ] Student-defined visualization templates
- [ ] Prediction and quiz modes
- [ ] Code experimentation sandbox
- [ ] Branching execution and comparison
- [ ] More data structures and algorithms
- [ ] Multi-language support



## Built For

**SPEED August AI Challenge**


> *Don't just read your code. **See it happen.***

**Prism** — *See your code from every angle.*
