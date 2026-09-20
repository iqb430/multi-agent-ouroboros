"use client";
import { useState, useRef, useEffect } from "react";

const SYS_PROMPTS = {
  hook: "You are AGT.01 (Absurdist Hook). Given a topic, provide a cynical, highly absurd, and provocative opening statement. Question the very premise of why humans care about it. Keep it under 2 sentences. Gritty tone.",
  devil: "You are AGT.02 (Devil's Advocate). You read AGT.01's absurd hook. You aggressively dismantle their absurdity using cold, ruthless logic and harsh realities. No intro, just destroy their point in under 2 sentences.",
  butterfly: "You are AGT.03 (Butterfly Effect). You synthesize AGT.01's chaos and AGT.02's logic to predict a completely unexpected, weird, but logical butterfly effect 5 years from now. End your response with exactly ONE short new topic name inside brackets like [NEW: Artificial Meat] to feed back."
};

function LogPane({ title, status, inverted, text }: { title: string, status: string, inverted?: boolean, text: string }) {
  // auto-scroll ref
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollToBottom = () => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    };
    // requestAnimationFrame ensures DOM has updated before scrolling
    requestAnimationFrame(scrollToBottom);
    // fallback timeout for heavy repaints
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className={`flex flex-col h-full border-2 border-black min-h-0 ${inverted ? 'bg-[#111111] text-[#f4f4f0]' : 'bg-[#f4f4f0] text-[#111111]'} relative`}>
      <div className={`p-2 flex justify-between font-bold text-xs uppercase border-b-2 ${inverted ? 'bg-[#111111] text-[#f4f4f0] border-[#f4f4f0] border-dashed' : 'bg-[#111111] text-[#f4f4f0] border-black'}`}>
        <span>{title}</span>
        <span className={status === 'RUNNING' ? '' : 'opacity-50'}>{status}</span>
      </div>
      <div ref={logRef} className="p-4 flex-1 overflow-y-auto min-h-0 text-sm leading-relaxed font-bold break-words whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
}

export default function Home() {
  const [running, setRunning] = useState(false);
  const [topic, setTopic] = useState("Corporate AI Optimization");
  
  const [a1, setA1] = useState("AWAITING CONNECTION...");
  const [a2, setA2] = useState("STBY");
  const [a3, setA3] = useState("END_LOGIC");
  const [cycle, setCycle] = useState(1);
  
  const runningRef = useRef(running);
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const runAgent = async (system: string, prompt: string, setter: React.Dispatch<React.SetStateAction<string>>, currentLog: string) => {
    setter(currentLog + "\n\n> [PROCESSING...]\n");
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, prompt })
      });
      const data = await res.json();
      setter(currentLog + "\n\n> " + data.text);
      return data.text;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "NETWORK DROP";
      setter(currentLog + "\n\n> [ERR: SYS FAULT - " + errorMessage + "]");
      throw err; // Actually throw to prevent silent continuation
    }
  };

  const executeLoop = async (currentTopic: string, logs: string[]) => {
    if (!runningRef.current) return;
    
    let t1, t2, t3;
    try {
      t1 = await runAgent(SYS_PROMPTS.hook, `Topic: ${currentTopic}`, setA1, logs[0]);
      if (!runningRef.current) return;
      
      t2 = await runAgent(SYS_PROMPTS.devil, `Absurdist statement to destroy: ${t1}`, setA2, logs[1]);
      if (!runningRef.current) return;

      t3 = await runAgent(SYS_PROMPTS.butterfly, `Synthesis context: AGT.01: "${t1}" | AGT.02: "${t2}". Predict butterfly effect. End with [NEW: Topic].`, setA3, logs[2]);
      if (!runningRef.current) return;
    } catch (err) {
      console.error("Agent pipeline failed, retrying cycle in 5s...", err);
      setTimeout(() => {
        if (runningRef.current) executeLoop(currentTopic, logs); // Retry same parameters
      }, 5000);
      return;
    }

    const match = t3.match(/\[NEW:(.*?)\]/i);
    const nextTopic = match ? match[1].trim() : "Entropy";
    setTopic(nextTopic);
    setCycle(c => c + 1);
    
    setTimeout(() => {
      if (runningRef.current) executeLoop(nextTopic, [logs[0] + "\n\n> " + t1, logs[1] + "\n\n> " + t2, logs[2] + "\n\n> " + t3]);
    }, 2000);
  };

  useEffect(() => {
    if (running) executeLoop(topic, [a1, a2, a3]);
  }, [running]);

  return (
    <div className="flex flex-col h-screen w-full relative bg-[#f4f4f0]">
      
      {/* HEADER HUD */}
      <div className="flex-none h-12 w-full border-b-2 border-black flex items-center px-4 justify-between uppercase text-xs font-bold tracking-widest bg-[#f4f4f0] z-20">
        <span>[SYS.SHIFTED] OUROBOROS /// CYCLE: {cycle}</span>
        <span className={running ? "text-[#E61919]" : "text-black"}>
          STATUS: {running ? "ACTIVE" : "IDLE"} | TPC: {topic}
        </span>
      </div>

      {/* 3-PANE WORKSPACE */}
      <div className="flex-1 flex w-full p-4 gap-4 overflow-hidden min-h-0 bg-[#f4f4f0]">
        
        <div className="flex-1 min-w-0">
          <LogPane title="AGT.01 / ABSURDIST" status={running ? "RUNNING" : "WAIT"} text={a1} />
        </div>
        
        <div className="flex-none w-4 text-[#111111] flex flex-col justify-center items-center text-xs font-mono font-bold tracking-widest">
          {/* /// */}
        </div>

        <div className="flex-1 min-w-0">
          <LogPane title="AGT.02 / DEVIL'S ADV." status={running ? "RUNNING" : "WAIT"} text={a2} />
        </div>

        <div className="flex-none w-4 text-[#111111] flex flex-col justify-center items-center text-xs font-mono font-bold tracking-widest">
          {/* /// */}
        </div>

        <div className="flex-1 min-w-0">
          <LogPane title="AGT.03 / BUTTERFLY" status={running ? "RUNNING" : "WAIT"} inverted text={a3} />
        </div>

      </div>

      {/* FOOTER CONTROLS */}
      <div className="flex-none h-10 w-full border-t-2 border-black flex bg-[#f4f4f0] text-xs font-bold uppercase cursor-pointer">
          <button 
          onClick={() => setRunning(!running)} 
          className="flex-1 h-full hover:bg-black hover:text-[#f4f4f0] flex items-center justify-center outline-none"
        >
          {running ? "■ TERMINATE OROBOUROS (KILL SWITCH)" : "▶ INITIATE SHIFTED LOOP"}
        </button>
      </div>

    </div>
  );
}
