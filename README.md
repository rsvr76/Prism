# Prism

> **Write real Python. See exactly what happened. Understand why it happened.**

Prism is an execution-grounded learning environment for Data Structures and Algorithms (DSA). Students write and execute genuine Python 3 in an in-browser WebAssembly sandbox, inspect physical memory mutations step by step through interactive visualizers, and receive contextual pedagogical explanations strictly grounded in the execution trace.

```
REAL PYTHON CODE
       ↓
REAL SANDBOXED EXECUTION (Pyodide Web Worker)
       ↓
IMMUTABLE PRISM TRACE (sys.settrace frames)
       ↓
┌───────────────┴───────────────┐
↓                               ↓
DETERMINISTIC VISUALS       GROUNDED AI (Tutor & Explainer)
(Arrays, Lists, Trees)          ↓
↓                               ↓
└───────────────┬───────────────┘
                ↓
       STUDENT UNDERSTANDING
```

---

## Why Prism?

Traditional DSA learning tools force students to choose between static illustrations that don't match their code, or raw debuggers that dump obscure memory addresses without pedagogical context.

Prism bridges this divide:
- **No Simulated Animations**: Visualizations reflect the exact runtime state of real Python execution.
- **Trace-Grounded Explanations**: The AI Tutor reads the physical memory diff between steps—it cannot guess or hallucinate variable states.
- **Hypothesis Testing**: With What-If branching, students can fork execution at any step, modify the code, and immediately compare the two execution trajectories side by side.

---

## How It Works

1. **Write or Select Code**: Write custom Python 3 or load reference algorithms and challenge starters.
2. **Preflight Safety**: An Abstract Syntax Tree (AST) analyzer validates syntax, line counts, and blocks unsafe modules before execution begins.
3. **Sandboxed Tracing**: Code runs inside an isolated Pyodide Web Worker. Python's `sys.settrace` records immutable frames containing line numbers, local/global variable scopes, call stacks, heap objects, and stdout.
4. **Deterministic Analysis**: Heuristic engines detect loop nesting, recursion depth, and pointer chains, computing empirical Big-O metrics.
5. **Interactive Visualization & Stepping**: Monaco Editor highlights the active source line in real time as students scrub the playback timeline.
6. **Grounded AI Assistance**: Students can inspect step explanations or chat with the AI Tutor, with all prompts referencing verified trace data.

---

## Learning Experience

Prism structures algorithmic discovery into progressive tiers:

- **Algorithm Library (`/library`)**: A searchable catalog of foundational algorithms and data structures categorized by topic and difficulty, featuring concept breakdowns, Big-O metrics, and "Try in Prism" workbench deep-linking.
- **Guided Learning Paths (`/paths`)**: Curated curriculums such as **DSA Foundations** (6 sequential stages, 10 lessons) with explicit prerequisites, mental models, and linear navigation.
- **Student Dashboard (`/dashboard`)**: A unified overview providing deterministic progress tracking, "Continue Learning" pointers, "Practice Next" recommendations, and bounded activity logging.

---

## Practice & Challenges

The **Practice System (`/practice`)** tests genuine algorithmic problem-solving through four distinct challenge types:
- **Code Completion**: Complete partial implementations to pass deterministic test cases.
- **Debugging**: Diagnose and repair logical bugs (e.g. off-by-one errors).
- **Trace Prediction**: Predict execution step counts, variable values, or loop iterations before running.
- **Complexity Identification**: Identify time and space complexity classes verified against the deterministic analyzer.

All submissions are evaluated against real Python test execution. The AI may provide contextual hints and feedback, but deterministic evaluation remains the sole authority.

---

## AI Tutor & Explainer

- **Grounded Step Explainer**: Diffing frame $N$ and frame $N+1$ produces factual explanations of variable assignments, pointer movements, and data structure mutations.
- **Interactive AI Tutor**: Multi-turn chat assistant aware of the active execution step, call stack, and active heap references.
- **Clear Distinction**: The UI explicitly labels deterministic observations ("Observed in Execution") separately from AI explanations ("Prism Explains").
- **Injection Resistant**: User code is quarantined inside isolated data blocks, preventing prompt injection attacks from altering tutor behavior.

---

## Security & Isolation

- **In-Browser Web Worker**: Code execution is isolated inside a dedicated Web Worker running WebAssembly Pyodide. No student code is sent to a remote server.
- **AST Preflight Guardrails**: Blocks dangerous built-in modules (`os`, `sys`, `subprocess`, `socket`, `eval`, `exec`) and limits source length.
- **Watchdog Protection**: Strict execution limits enforce a maximum of 1,000 trace frames, 50 call stack frames, and a 3,000 ms runtime ceiling.
- **Zero Leaked Secrets**: AI provider keys are restricted to server-side API routes and are never packaged into client bundles or stored in browser storage.

---

## Architecture

```
app/
├── (workbench)/page.tsx        # Main 3-panel interactive workbench
├── library/                   # Algorithm Library catalog and detail views
├── paths/                     # Guided Learning Paths and focused lessons
├── practice/                  # Practice challenges and interactive tests
├── dashboard/                 # Unified Student Progress Dashboard
└── api/ai/                    # Secure server-side AI proxy routes
components/
├── controls/                  # Execution header, controls, What-If modal
├── editor/                    # Monaco Editor integration with line sync
├── visualization/             # React Flow 1D Array, Linked List, Tree visualizers
├── debug/                     # Memory inspector, call stack, timeline scrubber
├── ai/                        # Step Explainer, Tutor Drawer, Complexity Panel
└── dashboard/                 # Student progress metrics and activity stream
lib/
├── execution/                 # TraceRunnerService, Pyodide Worker, AST validator
├── ai/                        # Complexity analyzer, grounded context builders
├── content/                   # Curriculums, algorithms, and challenge registries
├── learning/                  # Client-side lesson progress manager
├── practice/                  # Deterministic challenge evaluator & progress manager
└── progress/                  # Unified student progress aggregation and activity logs
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Runtime**: Pyodide (Python 3.12 WebAssembly) inside Dedicated Web Worker
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Visualizations**: `@xyflow/react` (React Flow)
- **State Management**: Zustand v5
- **AI Integration**: Google Gemini 2.5 Flash / REST Fallback with Zod validation
- **Testing**: Vitest (Unit & Integration) + Playwright (Real Browser E2E)

---

## Getting Started

### Prerequisites
- Node.js 18.17 or higher
- npm 9 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rsvr76/Prism.git
   cd Prism
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up Gemini API key for live AI tutoring in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Note: If no API key is provided, Prism operates 100% offline with deterministic fallbacks.*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

- Run Vitest unit & integration test suites:
  ```bash
  npm test
  ```
- Run Playwright real browser E2E test suites:
  ```bash
  npm run test:e2e
  ```
- Build production bundle:
  ```bash
  npm run build
  ```
