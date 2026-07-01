import { Handle, Position } from "@xyflow/react";
import { Brain, Sparkles } from "lucide-react";

export default function LLMNode({ data, isConnectable }: any) {
  const creativity = data.creativity ?? 0.7;
  let glowColor = "shadow-cyan-500/20 border-cyan-400";
  let headerColor = "bg-cyan-400 text-slate-950";
  let textColor = "text-cyan-400";
  let modeName = "Smart Mode 🧠";

  if (creativity > 0.8) {
    glowColor = "shadow-rose-500/20 border-rose-400";
    headerColor = "bg-rose-400 text-slate-950"; 
    textColor = "text-rose-400"; 
    modeName = "Silly Mode 🤪";
  } else if (creativity > 0.4) {
    glowColor = "shadow-purple-500/20 border-purple-400";
    headerColor = "bg-purple-400 text-slate-950"; 
    textColor = "text-purple-400"; 
    modeName = "Fun Mode 🎉";
  }

  return (
    <div className={`w-80 rounded-2xl bg-slate-900 border-2 ${glowColor} shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-slate-200 overflow-visible transition-all hover:scale-[1.01] pop-in-node`}>
      {/* Target input handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="text-in" 
        style={{ top: 80, background: "#f59e0b" }} 
        isConnectable={isConnectable} 
      />
      <div className="absolute text-[8px] font-bold text-amber-400 uppercase tracking-widest -left-4 top-[60px] -rotate-90 origin-bottom-right">LISTEN</div>
      
      <Handle 
        type="target" 
        position={Position.Left} 
        id="tools-in" 
        style={{ top: 140, background: "#10b981" }} 
        isConnectable={isConnectable} 
      />
      <div className="absolute text-[8px] font-bold text-emerald-400 uppercase tracking-widest -left-4 top-[120px] -rotate-90 origin-bottom-right">POWER</div>

      {/* Source output handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="text-out" 
        style={{ top: 80, background: "#ec4899" }} 
        isConnectable={isConnectable} 
      />
      <div className="absolute text-[8px] font-bold text-pink-400 uppercase tracking-widest -right-5 top-[60px] rotate-90 origin-bottom-left">THINK</div>

      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/50 bg-slate-500/5 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className={`p-1 ${headerColor} rounded-lg`}><Brain className="w-4 h-4" /></div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">🧠 Brain Core (LLM)</h3>
            <p className={`text-[10px] font-bold ${textColor} tracking-wider flex items-center gap-1 uppercase`}><Sparkles className="w-3 h-3" /> {modeName}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Creativity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <label>Creativity (Silliness)</label>
            <span className={textColor}>{Math.round(creativity * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={creativity} 
            onChange={(e) => data.onChange && data.onChange("creativity", parseFloat(e.target.value))} 
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800" 
            style={{ accentColor: creativity > 0.8 ? "#f43f5e" : creativity > 0.4 ? "#a855f7" : "#22d3ee" }} 
          />
        </div>

        {/* Prompt Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400">What should Circuit do? (Prompt)</label>
          <textarea 
            value={data.prompt} 
            onChange={(e) => data.onChange && data.onChange("prompt", e.target.value)} 
            placeholder="E.g., You are a friendly robot sidekick. Speak like a cute assistant! Keep it simple for kids." 
            className="w-full h-20 text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none font-sans" 
          />
        </div>
      </div>
    </div>
  );
}
