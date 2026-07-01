import { Handle, Position } from "@xyflow/react";
import { Terminal } from "lucide-react";

export default function InputNode({ data, isConnectable }: any) {
  return (
    <div className="w-64 rounded-xl sci-fi-panel hologram-effect border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-slate-200 font-sans overflow-visible">
      <Handle type="source" position={Position.Right} id="text-out" isConnectable={isConnectable} style={{ top: "50%", width: 16, height: 16, borderRadius: 4, background: "#f59e0b", border: "2px solid #0f172a", right: -8 }} />
      <div className="absolute text-[10px] font-black text-amber-500 uppercase tracking-widest -right-5 top-[35px] rotate-90 origin-bottom-left">DATA</div>

      <div className="flex items-center gap-3 px-3 py-2 border-b border-amber-500/30 bg-amber-950/40 relative z-10">
        <div className="p-1.5 bg-amber-500 rounded text-slate-900"><Terminal className="w-4 h-4" /></div>
        <div><h3 className="font-black text-xs tracking-wider text-amber-100 uppercase">Data Uplink</h3></div>
      </div>

      <div className="p-3 relative z-10">
        <input type="text" value={data.text} onChange={(e) => data.onChange && data.onChange("text", e.target.value)} placeholder="ENTER COMMAND..." className="w-full text-xs font-mono font-bold bg-black/60 border border-amber-500/30 rounded p-2 text-amber-400 placeholder-amber-700/50 focus:outline-none focus:border-amber-500" />
      </div>
    </div>
  );
}
