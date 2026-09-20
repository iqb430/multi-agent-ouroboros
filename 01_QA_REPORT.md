# QA REPORT: Shifted Ouroboros Ecosystem

## 1. Python Orchestrator (`shifted_arena.py`)

**Issue: Fatal Subprocess Timeouts**
- **Observation:** `subprocess.run(timeout=120)` lacked a handler for `subprocess.TimeoutExpired`. 
- **Mechanic Fix:** Implemented explicit handling for `.TimeoutExpired` and general `Exception`. The system now bubbles up `[ERR: TIMEOUT]` and `[ERR: FATAL EXCEPTION]` to `arena_log.md` to gracefully fail without collapsing the loop.

**Issue: Claude CLI Jargon Leaking ($ omniroute)**
- **Observation:** `clean_text = "\n".join(lines[-4:])` blindly scraped the end of stdout. `omniroute launch` / Claude can append checkmarks, tokens, or blank lines.
- **Mechanic Fix:** Re-engineered text cleanup to filter out empty lines, `*`, and checkmarks (`✔`). Added a fallback `[SILENCE - NULL OUTPUT]` so downstream prompts aren't fed empty strings.

**Issue: The Missing Topic Shift**
- **Observation:** Though `AGT.03` generated `[NEW TOPIC: X]`, `.py` never extracted or fed it to the next cycle.
- **Mechanic Fix:** Added regex extraction `r"\[NEW TOPIC:(.*?)\]"`. Captured topics are now aggressively injected into `arena_log.md` marking the Ouroboros cycle pivot point contextually.

## 2. Next.js Frontend (`app/page.tsx`)

**Issue: Defective Auto-Scroll**
- **Observation:** Updating DOM `scrollHeight` directly inside `useEffect` causes race conditions under React's render pipeline (text updates but height isn't painted yet).
- **Mechanic Fix:** Wrapped scroll execution in `requestAnimationFrame` and a sub-50ms `setTimeout` fallback, guaranteeing rock-solid scroll-to-bottom mechanics under high text load.

**Issue: Silent Pipeline Destruction**
- **Observation:** `runAgent`'s block caught errors but returned an empty string `""`. This pushed empty context (`t1`) structurally into the next prompt, poisoning the logic stream.
- **Mechanic Fix:** Forcibly `throw` on network drop / fault inside `runAgent`. `executeLoop` now carries an overarching `try/catch`. 
- **Mechanic Fix (Persistence):** If a cycle crashes, the application pauses, logs the drop, and automatically retries the exact same cycle parameters 5 seconds later.