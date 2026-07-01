import { Handle, Position } from "@xyflow/react";
import { Cpu, Zap } from "lucide-react";

export default function LLMNode({ data, isConnectable }: any) {
  const creativity = data.creativity ?? 0.7;
  let glowColor = "shadow-cyan-500/50 border-cyan-500/50";
  let headerColor = "bg-cyan-500";
  let textColor = "text-cyan-400";
  let modeName = "LOGIC MODE";

  if (creativity > 0.8) {
    glowColor = "shadow-rose-500/50 border-rose-500/50";
    headerColor = "bg-rose-500"; textColor = "text-rose-400"; modeName = "CHAOS MODE";
  } else if (creativity > 0.4) {
    glowColor = "shadow-purple-500/50 border-purple-500/50";
    headerColor = "bg-purple-500"; textColor = "text-purple-400"; modeName = "CREATIVE MODE";
  }

  return (
    <div className={`w-80 rounded-xl sci-fi-panel hologram-effect border-2 ${glowColor} shadow-[0_0_30px_rgba(0,0,0,0.5)] text-slate-200 font-sans overflow-visible transition-colors duration-500`}>
      <Handle type="target" position={Position.Left} id="text-in" style={{ top: 80, width: 16, height: 16, borderRadius: 4, background: "#f59e0b", border: "2px solid #0f172a", left: -8 }} isConnectable={isConnectable} />
      <div className="absolute text-[10px] font-black text-amber-500 uppercase tracking-widest -left-4 top-[60px] -rotate-90 origin-bottom-right">DATA</div>
      
      <Handle type="target" position={Position.Left} id="tools-in" style={{ top: 140, width: 16, height: 16, borderRadius: 4, background: "#10b981", border: "2px solid #0f172a", left: -8 }} isConnectable={isConnectable} />
      <div className="absolute text-[10px] font-black text-emerald-500 uppercase tracking-widest -left-4 top-[120px] -rotate-90 origin-bottom-right">MODS</div>

      <Handle type="source" position={Position.Right} id="text-out" style={{ top: 80, width: 16, height: 16, borderRadius: 4, background: "#ec4899", border: "2px solid #0f172a", right: -8 }} isConnectable={isConnectable} />
      <div className="absolute text-[10px] font-black text-pink-500 uppercase tracking-widest -right-5 top-[60px] rotate-90 origin-bottom-left">OUT</div>

      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-black/40">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 ${headerColor} rounded text-slate-900`}><Cpu className="w-5 h-5" /></div>
          <div>
            <h3 className="font-black text-sm tracking-wider text-slate-100 uppercase">Brain Core</h3>
            <p className={`text-[10px] font-bold ${textColor} tracking-widest uppercase flex items-center gap-1`}><Zap className="w-3 h-3" /> {modeName}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 relative z-10">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <label className="text-slate-400">Overclock (Chaos)</label>
            <span className={textColor}>{Math.round(creativity * 100)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={(e) => data.onChange && data.onChange("creativity", parseFloat(e.target.value))} className="w-full h-2 bg-slate-900 rounded appearance-none cursor-pointer border border-slate-700" style={{ accentColor: creativity > 0.8 ? "#f43f5e" : creativity > 0.4 ? "#a855f7" : "#06b6d4" }} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Directive</label>
          <textarea value={data.prompt} onChange={(e) => data.onChange && data.onChange("prompt", e.target.value)} placeholder="E.g., You are a Space Pirate..." className="w-full h-20 text-sm font-mono bg-black/60 border border-slate-700 rounded p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none" />
        </div>
      </div>
    </div>
  );
}
