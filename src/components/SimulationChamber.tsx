import { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Volume2, ShieldAlert, Sparkles, Search, Calculator, Image as ImageIcon, Trophy } from 'lucide-react';
import { useQuestStore } from '../store/questStore';

interface SimulationChamberProps {
  onExecute: (input: string) => Promise<{text: string, error?: string, usedTools?: string[]}>;
  isRunning: boolean;
  resultMsg: string | null;
  errorMsg: string | null;
  onClear: () => void;
  onClose: () => void;
}

export default function SimulationChamber({ onExecute, isRunning, resultMsg, errorMsg, onClear, onClose }: SimulationChamberProps) {
  const [input, setInput] = useState('');
  const [toolDeployed, setToolDeployed] = useState<string | null>(null);
  const [history, setHistory] = useState<{role: 'user'|'agent', content: string}[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isQuestComplete = useQuestStore(state => state.isComplete);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isRunning, toolDeployed]);

  const speak = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Pitch shift for robotic voice
    utterance.pitch = 0.5;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isRunning) return;
    const currentInput = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: currentInput }]);
    
    // Clear previous tools
    setToolDeployed(null);
    onClear();

    try {
      const res = await onExecute(currentInput);
      
      if (res.usedTools && res.usedTools.length > 0) {
        setToolDeployed(res.usedTools[0]);
        setTimeout(() => setToolDeployed(null), 2500);
      }
      
      if (res.text && !res.error) {
        setHistory(prev => [...prev, { role: 'agent', content: res.text }]);
        speak(res.text);
      }
    } catch (e: any) {
       // Handled by parent
    }
  };

  const getToolIcon = (tool: string) => {
    if (tool.includes('search')) return <Search className="w-12 h-12 text-blue-400" />;
    if (tool.includes('calculator')) return <Calculator className="w-12 h-12 text-green-400" />;
    if (tool.includes('image')) return <ImageIcon className="w-12 h-12 text-pink-400" />;
    return <Sparkles className="w-12 h-12 text-yellow-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-black/90 border-l border-indigo-500/30 w-full md:w-96 shrink-0 relative overflow-hidden backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-500/30 bg-indigo-950/40">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <h2 className="text-indigo-100 font-black text-sm tracking-widest uppercase">Simulation Chamber</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-lg transition-colors ${ttsEnabled ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            title="Toggle Robot Voice"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs"
            title="Close Chamber"
          >
            ❌
          </button>
        </div>
      </div>

      {isQuestComplete && (
        <div className="bg-emerald-950/60 border-b border-emerald-500/50 p-3 flex items-center justify-center gap-2 animate-in slide-in-from-top fade-in duration-500">
          <Trophy className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span className="text-emerald-400 font-black text-xs tracking-widest uppercase">Agent Fully Operational</span>
        </div>
      )}

      {/* Tool Deployment Overlay Animation */}
      {toolDeployed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-bounce">
             <div className="relative">
               <div className="absolute inset-0 bg-cyan-500 blur-[50px] opacity-50 rounded-full animate-pulse" />
               <div className="relative bg-black border border-cyan-500/50 p-6 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                 {getToolIcon(toolDeployed)}
               </div>
             </div>
             <div className="mt-6 text-center">
               <h3 className="text-cyan-400 font-black text-xl tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                 Skill Deployed!
               </h3>
               <p className="text-cyan-100/70 font-mono text-sm mt-2 uppercase">
                 Executing: {toolDeployed.replace('_', ' ')}
               </p>
             </div>
          </div>
        </div>
      )}

      {/* Chat / Simulation Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && !isRunning && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Cpu className="w-12 h-12 text-indigo-400" />
            <div>
              <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Chamber Ready</p>
              <p className="text-slate-400 text-xs mt-1">Initiate test sequence below.</p>
            </div>
          </div>
        )}

        {history.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-2.5 rounded-xl max-w-[85%] text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-slate-800 border border-indigo-500/30 text-slate-200 rounded-bl-sm font-mono'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isRunning && (
          <div className="flex items-start">
            <div className="bg-slate-800 border border-indigo-500/30 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-3 w-48">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0ms'}} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '150ms'}} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '300ms'}} />
              </div>
              <span className="text-xs font-mono text-indigo-400 uppercase">Processing...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-mono flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-indigo-500/30 bg-black/40">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isRunning}
            placeholder="INPUT TEST DATA..."
            className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder-indigo-500/50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 font-mono uppercase transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isRunning}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
