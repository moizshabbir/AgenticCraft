import { useState, useCallback, useRef, useEffect } from "react";
import { ReactFlow, Controls, addEdge, useNodesState, useEdgesState, Connection, Edge, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import LLMNode from "./nodes/LLMNode";
import ToolNode from "./nodes/ToolNode";
import OutputNode from "./nodes/OutputNode";
import InputNode from "./nodes/InputNode";
import SimulationChamber from "./SimulationChamber";
import CircuitHelper from "./CircuitHelper";
import { useQuestStore } from "../store/questStore";

const nodeTypes = { llm_node: LLMNode, tool_node: ToolNode, output_node: OutputNode, input_node: InputNode };

export function WorkspaceCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const evaluateGraph = useQuestStore(state => state.evaluateGraph);
  const triggerBlockDescription = useQuestStore(state => state.triggerBlockDescription);
  const prevNodesLengthRef = useRef(nodes.length);

  useEffect(() => {
    evaluateGraph(nodes, edges);
    
    // Check if a new node was added
    if (nodes.length > prevNodesLengthRef.current) {
      const newNode = nodes[nodes.length - 1]; // Assuming the new node is added at the end
      if (newNode) {
        triggerBlockDescription(newNode.type as string);
      }
    }
    prevNodesLengthRef.current = nodes.length;
  }, [nodes, edges, evaluateGraph, triggerBlockDescription]);

  const onConnect = useCallback((params: Connection | Edge) => {
    let edgeColor = "#94a3b8";
    if (params.sourceHandle?.startsWith("tools")) edgeColor = "#10b981";
    else if (params.sourceHandle?.startsWith("text")) edgeColor = "#ec4899"; 

    const sourceNode = nodes.find(n => n.id === params.source);
    if (sourceNode?.type === "input_node") edgeColor = "#f59e0b";
    if (sourceNode?.type === "llm_node") edgeColor = "#ec4899";

    setEdges((eds) => addEdge({ ...params, animated: false, style: { stroke: edgeColor, strokeWidth: 3 } }, eds));
  }, [nodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowInstance || !reactFlowWrapper.current) return;
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type,
      position,
      data: { 
        ...(type === "input_node" && { text: "" }),
        ...(type === "llm_node" && { creativity: 0.7, prompt: "" }),
        ...(type === "tool_node" && { tool: "google_search" }),
        onChange: (key: string, value: any) => {
            setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n));
        }
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const handleExecute = async (input: string) => {
    setIsRunning(true);
    setResultMsg(null);
    setErrorMsg(null);

    // Animate Input to LLM Beam and flash LLM node
    setEdges(eds => eds.map(e => {
        const srcNode = nodes.find(n => n.id === e.source);
        if (srcNode?.type === "input_node") {
            return { ...e, className: "processing-beam stroke-amber-400 stroke-[4px]" };
        }
        return e;
    }));
    setNodes(nds => nds.map(n => n.type === "llm_node" ? { ...n, className: "shadow-[0_0_50px_rgba(99,102,241,1)] animate-pulse" } : n));

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph: { nodes, edges }, userInputValue: input })
      });
      const data = await response.json();
      
      // Animate LLM to Output Beam and flash Output node
      setEdges(eds => eds.map(e => {
          const srcNode = nodes.find(n => n.id === e.source);
          if (srcNode?.type === "llm_node") {
              return { ...e, className: "processing-beam stroke-pink-400 stroke-[4px]" };
          }
          return { ...e, className: "" };
      }));
      setNodes(nds => nds.map(n => n.type === "llm_node" ? { ...n, className: "" } : n.type === "output_node" ? { ...n, className: "shadow-[0_0_50px_rgba(236,72,153,1)] animate-pulse" } : n));

      setTimeout(() => {
         setEdges((eds) => eds.map(e => ({ ...e, className: "" })));
         setNodes(nds => nds.map(n => ({ ...n, className: "" })));
      }, 1500);

      if (data.error) throw new Error(data.error);
      setResultMsg(data.text);
      return { text: data.text, usedTools: data.usedTools };
    } catch (err: any) {
      setErrorMsg(err.message);
      setEdges((eds) => eds.map(e => ({ ...e, className: "" })));
      throw err;
    } finally {
      setIsRunning(false);
    }
  };

  const handlePublish = async () => {
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "My Arcade App", graph: { nodes, edges } })
      });
      const data = await response.json();
      window.open(`/arcade/${data.id}`, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#050510] text-white">
      <div className="w-64 bg-black/80 border-r border-indigo-900/50 p-4 shrink-0 flex flex-col gap-2">
        <h2 className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">Block Library</h2>
        
        <div draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "input_node")} className="p-3 bg-slate-900 border border-slate-700 cursor-grab rounded hover:border-amber-500 text-sm">Data Uplink (Input)</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "llm_node")} className="p-3 bg-slate-900 border border-slate-700 cursor-grab rounded hover:border-indigo-500 text-sm">Brain Core (LLM)</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "tool_node")} className="p-3 bg-slate-900 border border-slate-700 cursor-grab rounded hover:border-emerald-500 text-sm">Mod Chip (Tool)</div>
        <div draggable onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "output_node")} className="p-3 bg-slate-900 border border-slate-700 cursor-grab rounded hover:border-pink-500 text-sm">Comms Link (Output)</div>
        
        <div className="mt-auto pt-4 border-t border-slate-800">
            <button onClick={handlePublish} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded font-mono uppercase tracking-widest text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                🚀 Publish App
            </button>
        </div>
      </div>
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          className="cyber-grid"
        >
          <Controls />
        </ReactFlow>
        <CircuitHelper />
      </div>
      <SimulationChamber onExecute={handleExecute} isRunning={isRunning} resultMsg={resultMsg} errorMsg={errorMsg} onClear={() => {}} />
    </div>
  );
}

export default function WorkspaceCanvasWrapper() {
  return <ReactFlowProvider><WorkspaceCanvas /></ReactFlowProvider>;
}
