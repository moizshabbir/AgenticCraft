import { Handle, Position } from "@xyflow/react";
import { Wrench } from "lucide-react";

export default function ToolNode({ data, isConnectable }: any) {
  return (
    <div className="w-56 rounded-2xl bg-slate-900 border-2 border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.2)] text-slate-100 overflow-visible transition-all hover:scale-[1.02] pop-in-node">
      <Handle 
        type="source" 
        position={Position.Right} 
        id="tools-out" 
        isConnectable={isConnectable} 
        style={{ top: "50%", background: "#10b981" }} 
      />
      <div className="absolute text-[9px] font-bold text-emerald-400 uppercase tracking-widest -right-5 top-[35px] rotate-90 origin-bottom-left">POWER</div>

      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-emerald-500/25 bg-emerald-500/10 rounded-t-2xl">
        <div className="p-1 bg-emerald-400 rounded-lg text-slate-950"><Wrench className="w-4 h-4" /></div>
        <h3 className="font-bold text-sm text-emerald-200">🛠️ Mod Chip (Tool)</h3>
      </div>

      <div className="p-3">
        <select 
          value={data.tool} 
          onChange={(e) => data.onChange && data.onChange("tool", e.target.value)} 
          className="w-full text-xs font-bold bg-slate-950 border border-emerald-500/30 rounded-xl p-2.5 text-emerald-300 focus:outline-none focus:border-emerald-400 cursor-pointer appearance-none text-center"
        >
          <option value="google_search">🔍 Google Search</option>
          <option value="calculator">🧮 Calculator</option>
        </select>
      </div>
    </div>
  );
}
