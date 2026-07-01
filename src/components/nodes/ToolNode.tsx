import { Handle, Position } from "@xyflow/react";
import { Database } from "lucide-react";

export default function ToolNode({ data, isConnectable }: any) {
  return (
    <div className="w-56 rounded-xl sci-fi-panel hologram-effect border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-slate-200 font-sans overflow-visible group">
      <Handle type="source" position={Position.Right} id="tools-out" isConnectable={isConnectable} style={{ top: "50%", width: 16, height: 16, borderRadius: 4, background: "#10b981", border: "2px solid #0f172a", right: -8 }} />
      <div className="absolute text-[10px] font-black text-emerald-500 uppercase tracking-widest -right-5 top-[35px] rotate-90 origin-bottom-left">MOD</div>

      <div className="flex items-center gap-3 px-3 py-2 border-b border-emerald-500/30 bg-emerald-950/40 relative z-10">
        <div className="p-1.5 bg-emerald-500 rounded text-slate-900"><Database className="w-4 h-4" /></div>
        <div><h3 className="font-black text-xs tracking-wider text-emerald-100 uppercase">Mod Chip</h3></div>
      </div>

      <div className="p-3 relative z-10">
        <select value={data.tool} onChange={(e) => data.onChange && data.onChange("tool", e.target.value)} className="w-full text-xs font-mono font-bold uppercase bg-black/60 border border-emerald-500/30 rounded p-2 text-emerald-400 focus:outline-none focus:border-emerald-500 appearance-none">
          <option value="google_search">🔍 Web Scanner</option>
          <option value="calculator">🧮 Math Coprocessor</option>
        </select>
      </div>
    </div>
  );
}
