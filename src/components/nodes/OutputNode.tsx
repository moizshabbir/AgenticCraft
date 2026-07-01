import { Handle, Position } from "@xyflow/react";
import { Volume2 } from "lucide-react";

export default function OutputNode({ data, isConnectable }: any) {
  return (
    <div className="w-64 rounded-2xl bg-slate-900 border-2 border-pink-400 shadow-[0_4px_15px_rgba(236,72,153,0.2)] text-slate-100 overflow-visible transition-all hover:scale-[1.02] pop-in-node">
      <Handle 
        type="target" 
        position={Position.Left} 
        id="text-in" 
        isConnectable={isConnectable} 
        style={{ top: "50%", background: "#ec4899" }} 
      />
      <div className="absolute text-[9px] font-bold text-pink-400 uppercase tracking-widest -left-4 top-[35px] -rotate-90 origin-bottom-right">SPEAK</div>

      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-pink-500/25 bg-pink-500/10 rounded-t-2xl">
        <div className="p-1 bg-pink-400 rounded-lg text-slate-950"><Volume2 className="w-4 h-4" /></div>
        <h3 className="font-bold text-sm text-pink-200">🗣️ Mouth (Output)</h3>
      </div>

      <div className="p-3">
        <div className="bg-slate-950 rounded-xl p-3 text-xs text-pink-300/80 border border-pink-500/20 min-h-[60px] flex items-center justify-center text-center font-sans">
          Ready to speak...
        </div>
      </div>
    </div>
  );
}
