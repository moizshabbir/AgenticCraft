import { Handle, Position } from "@xyflow/react";
import { Mic } from "lucide-react";

export default function InputNode({ data, isConnectable }: any) {
  return (
    <div className="w-64 rounded-2xl bg-slate-900 border-2 border-amber-400 shadow-[0_4px_15px_rgba(245,158,11,0.2)] text-slate-100 overflow-visible transition-all hover:scale-[1.02] pop-in-node">
      <Handle 
        type="source" 
        position={Position.Right} 
        id="text-out" 
        isConnectable={isConnectable} 
        style={{ top: "50%", background: "#f59e0b" }} 
      />
      <div className="absolute text-[9px] font-bold text-amber-400 uppercase tracking-widest -right-5 top-[35px] rotate-90 origin-bottom-left">LISTEN</div>

      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-amber-500/25 bg-amber-500/10 rounded-t-2xl">
        <div className="p-1 bg-amber-400 rounded-lg text-slate-950"><Mic className="w-4 h-4" /></div>
        <h3 className="font-bold text-sm text-amber-200">👂 Ears (Input)</h3>
      </div>

      <div className="p-3">
        <input 
          type="text" 
          value={data.text} 
          onChange={(e) => data.onChange && data.onChange("text", e.target.value)} 
          placeholder="Say hello to Circuit here..." 
          className="w-full text-xs bg-slate-950 border border-amber-500/30 rounded-xl p-2.5 text-amber-300 placeholder-amber-700/60 focus:outline-none focus:border-amber-400 font-sans" 
        />
      </div>
    </div>
  );
}
