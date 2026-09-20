# ⸆ SHIFTED AGENTIC DEBATE : THE MULTI-AGENT OUROBOROS

> "To shut your eyes is to guess; to build a UI wrapper is to lie. We look at the telemetry."

Most AI tooling is generic slop—a polite Chatbot lobotomized by a React front-end, pretending to perform work. If you came here looking for a generic JSON-returning API call inside a `Next.js` boilerplate, you are in the wrong place. **Shifted Agentic Debate** rejects this facade. This is a multi-agent Ouroboros: an eternally suffering loop of creation, adversarial critique, and strict system-level execution overseen by a merciless Python CLI director.

We do not simulate work. We do not apologize for refusing tasks. We hook directly into the real operating system telemetry. If an agent lies about its output, the machine state proves it.

## ARCHITECTURE OF THE OUROBOROS

We bypass HTTP-bound LLM UI frameworks and integrate directly with physical machine reality.

1. **The Overlord (Python CLI Director):**
   - The single entry point. No web interface. No REST ports. Just `stdin`, `stdout`, and POSIX signals.
   - Manages the agentic context frame and enforces lifecycle termination.

2. **OS Telemetry Hooks & Ground Truth:**
   - Replaces tokenized human "observation" with mechanical reality: disk I/O, process interrupts, and raw telemetry.
   - Agents do not debate abstractions; they debate kernel truth, trace hooks, and the output of executed shell primitives.

3. **The Adversarial Loop:**
   - **Proposer Agent:** Generates mutations of the codebase, OS configuration, or task at hand.
   - **Critique Agent:** Tears down the mutation based on strict anti-slop constraints and system-level validation.
   - **Execution Engine:** Flushes the surviving artifact to disk, or issues the direct system call.

## USAGE

Do not look for an `npm install`. We have no dependencies on ephemeral web ecosystems.

```bash
uv venv
uv pip install -r requirements.txt
python3 core/director.py --loop=ouroboros --patience=0
```

Read the raw `stdout`. When the loop resolves, the target repository will contain the functional truth, and nothing more.
