import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Play, Volume2, VolumeX, Mic, Send, ShieldAlert, Sparkles, Cpu, Joystick, Zap } from "lucide-react";

export default function FriendView() {
  const { id } = useParams();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{role: 'user'|'agent', content: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/app/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setAppData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050510] text-cyan-500 font-mono text-xl animate-pulse">LOADING ARCADE...</div>;
  if (error) return <div className="h-screen w-full flex items-center justify-center bg-[#050510] text-rose-500 font-mono text-xl">ERROR: {error}</div>;

  const llmNode = appData?.graph?.nodes?.find((n: any) => n.type === "llm_node");
  const creativity = llmNode?.data?.creativity ?? 0.7;
  const promptText = llmNode?.data?.prompt || "";
  
  const powerLevel = Math.floor(Math.random() * 20) + 80; // 80 to 99
  let type = "Agentic Explorer";
  if (creativity > 0.8) type = "Chaos Engine";
  else if (creativity < 0.3) type = "Logic Processor";
  else if (promptText.toLowerCase().includes("pirate")) type = "Space Corsair";

  const speak = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = creativity > 0.8 ? 1.5 : (creativity < 0.3 ? 0.5 : 1);
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleExecute = async () => {
    if (!input.trim() || isProcessing) return;
    const currentInput = input;
    setInput("");
    setHistory(prev => [...prev, { role: 'user', content: currentInput }]);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: appData.graph, userInputValue: currentInput })
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setHistory(prev => [...prev, { role: 'agent', content: data.text }]);
      speak(data.text);
    } catch (err: any) {
      setHistory(prev => [...prev, { role: 'agent', content: `SYSTEM ERROR: ${err.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050510] flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* Arcade Cabinet Outer */}
      <div className="w-full max-w-4xl bg-slate-900 border-[8px] border-slate-800 rounded-t-[3rem] rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col">
        {/* Marquee Header */}
        <div className="bg-gradient-to-r from-fuchsia-900 via-purple-900 to-indigo-900 p-6 border-b-4 border-slate-950 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" style={{ backgroundImage: "linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.05) 50%)", backgroundSize: "10px 10px" }}></div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 tracking-widest uppercase relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: "1px #92400e" }}>
              {appData?.title || "Agent Arcade"}
            </h1>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse"></div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse"></div>
        </div>

        {/* Screen Area */}
        <div className="p-8 bg-slate-950 border-x-[12px] border-slate-800 relative shadow-[inset_0_0_50px_rgba(0,0,0,1)] flex-1 min-h-[500px] flex flex-col">
            {/* Screen Bezel */}
            <div className="absolute inset-0 border-[16px] border-slate-900 rounded-3xl pointer-events-none z-20"></div>
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-10" style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 4px, 3px 100%" }}></div>

            {!started ? (
              // Splash Screen
              <div className="flex-1 flex flex-col items-center justify-center relative z-30 animate-in zoom-in duration-500">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center justify-center mb-8 border-4 border-cyan-300/50">
                     <Cpu className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="bg-black/60 border border-cyan-500/30 rounded-xl p-6 w-full max-w-md text-center space-y-4 backdrop-blur-sm">
                      <div>
                        <p className="text-cyan-500/70 text-xs font-mono tracking-widest uppercase">Agent Profile</p>
                        <h2 className="text-2xl font-black text-cyan-500 tracking-wider uppercase mt-1">{type}</h2>
                      </div>
                      
                      <div className="flex justify-center gap-8 py-4 border-y border-cyan-500/20">
                          <div>
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-mono">Power Level</p>
                              <p className="text-amber-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{powerLevel}</p>
                          </div>
                          <div>
                              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-mono">Chaos</p>
                              <p className="text-rose-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">{Math.round(creativity * 100)}%</p>
                          </div>
                      </div>

                      <button onClick={() => setStarted(true)} className="w-full py-4 mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl tracking-[0.3em] rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105 uppercase flex items-center justify-center gap-3">
                          <Play className="w-6 h-6 fill-current" /> Insert Coin
                      </button>
                  </div>
              </div>
            ) : (
              // Interactive Mode
              <div className="flex-1 flex flex-col relative z-30 h-full max-h-[500px]">
                  {/* Chat History */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                      {history.length === 0 && (
                          <div className="h-full flex items-center justify-center text-cyan-500/50 font-mono text-sm uppercase tracking-widest animate-pulse">
                              Awaiting User Input...
                          </div>
                      )}
                      {history.map((msg, idx) => (
                          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                                  msg.role === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                    : 'bg-slate-800 border-2 border-cyan-500/50 text-cyan-50 rounded-bl-sm font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                              }`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                      {isProcessing && (
                          <div className="flex items-start">
                              <div className="bg-slate-800 border-2 border-cyan-500/50 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Processing...</span>
                              </div>
                          </div>
                      )}
                      <div ref={bottomRef} />
                  </div>
              </div>
            )}
        </div>

        {/* Control Deck */}
        <div className="bg-slate-800 p-6 border-t-8 border-slate-950 flex gap-4 items-center relative z-20">
            {/* Joystick / Deco */}
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-700 shadow-inner flex items-center justify-center shrink-0 hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-red-600 shadow-[inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
            </div>

            <div className="flex-1 relative">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && started && handleExecute()}
                    disabled={!started || isProcessing}
                    placeholder={started ? "TYPE COMMAND..." : "PRESS START TO PLAY"}
                    className="w-full bg-slate-950 border-4 border-slate-700 rounded-xl py-4 pl-14 pr-16 text-cyan-400 font-mono text-lg placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-0 uppercase disabled:opacity-50"
                />
                
                <button
                    onClick={() => {
                        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                        if (!SpeechRecognition) return alert("Voice input not supported in this browser.");
                        const recognition = new SpeechRecognition();
                        recognition.onresult = (event: any) => {
                            setInput(event.results[0][0].transcript);
                        };
                        recognition.start();
                    }}
                    disabled={!started || isProcessing}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center text-cyan-500 transition-all"
                >
                    <Mic className="w-5 h-5" />
                </button>

                <button
                    onClick={handleExecute}
                    disabled={!started || !input.trim() || isProcessing}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 flex items-center justify-center text-yellow-950 transition-all"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Sound Toggles */}
            <div className="flex gap-2 shrink-0">
                <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                        ttsEnabled 
                            ? 'bg-blue-500 border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white' 
                            : 'bg-slate-700 border-slate-900 text-slate-500'
                    }`}
                >
                    {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
