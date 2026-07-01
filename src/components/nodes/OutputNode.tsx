import { Handle, Position } from "@xyflow/react";
import { RadioReceiver } from "lucide-react";

export default function OutputNode({ data, isConnectable }: any) {
  return (
    <div className="w-64 rounded-xl sci-fi-panel hologram-effect border-2 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-slate-200 font-sans overflow-visible">
      <Handle type="target" position={Position.Left} id="text-in" isConnectable={isConnectable} style={{ top: "50%", width: 16, height: 16, borderRadius: 4, background: "#ec4899", border: "2px solid #0f172a", left: -8 }} />
      <div className="absolute text-[10px] font-black text-pink-500 uppercase tracking-widest -left-4 top-[35px] -rotate-90 origin-bottom-right">DATA</div>

      <div className="flex items-center gap-3 px-3 py-2 border-b border-pink-500/30 bg-pink-950/40 relative z-10">
        <div className="p-1.5 bg-pink-500 rounded text-slate-900"><RadioReceiver className="w-4 h-4" /></div>
        <div><h3 className="font-black text-xs tracking-wider text-pink-100 uppercase">Comms Link</h3></div>
      </div>

      <div className="p-3 relative z-10">
        <div className="bg-black/60 rounded p-3 text-xs font-mono text-pink-400/50 border border-pink-500/30 min-h-[60px] flex items-center justify-center animate-pulse">
          AWAITING TRANSMISSION...
        </div>
      </div>
    </div>
  );
}
