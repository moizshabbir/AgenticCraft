import { useState, useCallback, useRef, useEffect } from "react";
import { ReactFlow, Controls, addEdge, useNodesState, useEdgesState, Connection, Edge, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import LLMNode from "./nodes/LLMNode";
import ToolNode from "./nodes/ToolNode";
import OutputNode from "./nodes/OutputNode";
import InputNode from "./nodes/InputNode";
import SimulationChamber from "./SimulationChamber";
import CircuitHelper from "./CircuitHelper";
import LevelHub from "./LevelHub";
import { useQuestStore } from "../store/questStore";
import { translations } from "../constants/translations";

const nodeTypes = { llm_node: LLMNode, tool_node: ToolNode, output_node: OutputNode, input_node: InputNode };

export function WorkspaceCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSimChamberOpen, setIsSimChamberOpen] = useState(false);
  
  const { currentLevel, setLevel, setScreen, score, title, isComplete, completeLevel, language, evaluateGraph, triggerBlockDescription } = useQuestStore();
  const prevNodesLengthRef = useRef(nodes.length);

  // Template loader function
  const loadTemplateForLevel = useCallback((lvl: 1 | 2 | 3) => {
    const id = Date.now();
    let levelNodes: any[] = [];
    let levelEdges: any[] = [];

    if (lvl === 1) {
      const inputId = `node_input_${id}`;
      const llmId = `node_llm_${id}`;
      const outputId = `node_output_${id}`;

      levelNodes = [
        {
          id: inputId,
          type: "input_node",
          position: { x: 50, y: 150 },
          data: { text: "Hello Circuit!" }
        },
        {
          id: llmId,
          type: "llm_node",
          position: { x: 250, y: 150 },
          data: { creativity: 0.7, prompt: "You are Circuit, a cute robot friend! Keep your answer short and friendly." }
        },
        {
          id: outputId,
          type: "output_node",
          position: { x: 450, y: 150 },
          data: {}
        }
      ];

      levelEdges = [
        { id: `edge_${inputId}_${llmId}`, source: inputId, target: llmId, style: { stroke: "#f59e0b", strokeWidth: 3 } },
        { id: `edge_${llmId}_${outputId}`, source: llmId, target: outputId, style: { stroke: "#ec4899", strokeWidth: 3 } }
      ];
    } else if (lvl === 2) {
      const inputId = `node_input_${id}`;
      const llmId = `node_llm_${id}`;
      const toolId = `node_tool_${id}`;
      const outputId = `node_output_${id}`;

      levelNodes = [
        {
          id: inputId,
          type: "input_node",
          position: { x: 50, y: 180 },
          data: { text: "What is 156 * 24?" }
        },
        {
          id: llmId,
          type: "llm_node",
          position: { x: 280, y: 180 },
          data: { creativity: 0.5, prompt: "If there is a math problem, use the calculator tool to answer!" }
        },
        {
          id: toolId,
          type: "tool_node",
          position: { x: 280, y: 40 },
          data: { tool: "calculator" }
        },
        {
          id: outputId,
          type: "output_node",
          position: { x: 500, y: 180 },
          data: {}
        }
      ];

      levelEdges = [
        { id: `edge_${inputId}_${llmId}`, source: inputId, target: llmId, style: { stroke: "#f59e0b", strokeWidth: 3 } },
        { id: `edge_${toolId}_${llmId}`, source: toolId, target: llmId, style: { stroke: "#10b981", strokeWidth: 3 } },
        { id: `edge_${llmId}_${outputId}`, source: llmId, target: outputId, style: { stroke: "#ec4899", strokeWidth: 3 } }
      ];
    } else if (lvl === 3) {
      const inputId = `node_input_${id}`;
      const llm1Id = `node_llm1_${id}`;
      const llm2Id = `node_llm2_${id}`;
      const outputId = `node_output_${id}`;

      levelNodes = [
        {
          id: inputId,
          type: "input_node",
          position: { x: 50, y: 200 },
          data: { text: "rocket ship" }
        },
        {
          id: llm1Id,
          type: "llm_node",
          position: { x: 250, y: 100 },
          data: { creativity: 0.8, prompt: "Generate a 1-sentence story idea about: {input}" }
        },
        {
          id: llm2Id,
          type: "llm_node",
          position: { x: 250, y: 300 },
          data: { creativity: 0.7, prompt: "Add details and fun emojis to this story sentence: {input}" }
        },
        {
          id: outputId,
          type: "output_node",
          position: { x: 500, y: 200 },
          data: {}
        }
      ];

      levelEdges = [
        { id: `edge_${inputId}_${llm1Id}`, source: inputId, target: llm1Id, style: { stroke: "#f59e0b", strokeWidth: 3 } },
        { id: `edge_${llm1Id}_${llm2Id}`, source: llm1Id, target: llm2Id, style: { stroke: "#ec4899", strokeWidth: 3 } },
        { id: `edge_${llm2Id}_${outputId}`, source: llm2Id, target: outputId, style: { stroke: "#ec4899", strokeWidth: 3 } }
      ];
    }

    // Attach onChange listeners and spring entrance animation
    const preppedNodes = levelNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onChange: (key: string, val: any) => {
          setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, [key]: val } } : n));
        }
      }
    }));

    setNodes(preppedNodes);
    setEdges(levelEdges);
    setIsSimChamberOpen(false);
  }, [setNodes, setEdges]);

  // Load appropriate template whenever level state sets
  useEffect(() => {
    loadTemplateForLevel(currentLevel);
  }, [currentLevel, loadTemplateForLevel]);

  useEffect(() => {
    evaluateGraph(nodes, edges);
    
    // Check if a new node was added and introduce it
    if (nodes.length > prevNodesLengthRef.current) {
      const newNode = nodes[nodes.length - 1];
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

  const handleLevelSelect = (lvl: 1 | 2 | 3) => {
    setLevel(lvl);
  };

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
    setNodes(nds => nds.map(n => n.type === "llm_node" ? { ...n, className: "shadow-[0_0_50px_rgba(99,102,241,1)] animate-[bounce_1s_infinite]" } : n));

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

      // Trigger gamification success / level complete state!
      completeLevel();

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
        body: JSON.stringify({ title: `Quest Level ${currentLevel} App`, graph: { nodes, edges } })
      });
      const data = await response.json();
      window.open(`/arcade/${data.id}`, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic connection checklist variables
  const hasInput = nodes.some(n => n.type === 'input_node');
  const hasOutput = nodes.some(n => n.type === 'output_node');
  const llmNodes = nodes.filter(n => n.type === 'llm_node');
  const toolNodes = nodes.filter(n => n.type === 'tool_node');

  const inputToLLM = edges.some(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return src?.type === 'input_node' && tgt?.type === 'llm_node';
  });

  const llmToOutput = edges.some(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return src?.type === 'llm_node' && tgt?.type === 'output_node';
  });

  const toolToLLM = edges.some(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return src?.type === 'tool_node' && tgt?.type === 'llm_node';
  });

  const llm1ToLLM2 = edges.some(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    return src?.type === 'llm_node' && tgt?.type === 'llm_node';
  });

  const llm2ToOutput = edges.some(e => {
    const src = nodes.find(n => n.id === e.source);
    const tgt = nodes.find(n => n.id === e.target);
    if (src?.type !== 'llm_node' || tgt?.type !== 'output_node') return false;
    return edges.some(edge2 => {
      const src2 = nodes.find(n => n.id === edge2.source);
      return src2?.type === 'llm_node' && edge2.target === src.id;
    });
  });

  // Evaluate if checklist is complete
  const isReady = currentLevel === 1
    ? (hasInput && hasOutput && llmNodes.length >= 1 && inputToLLM && llmToOutput)
    : currentLevel === 2
    ? (inputToLLM && llmToOutput && toolToLLM)
    : (inputToLLM && llm1ToLLM2 && llm2ToOutput);

  return (
    <div className="h-screen w-full flex flex-col bg-[#050510] text-white">
      {/* 1. Slim Static Top Navigation Header */}
      <header className="h-16 border-b border-indigo-950/60 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('hub')}
            className="px-4 py-1.5 rounded-full font-bold text-xs bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(6,182,212,0.15)]"
          >
            <span>🗺️ Level Map</span>
          </button>
          <span className="text-slate-800">|</span>
          <h1 className="text-base font-extrabold text-slate-100 tracking-wide font-sans">
            {language === 'ur' ? 'ایجنٹک کرافٹ' : 'AgenticCraft'}
          </h1>
        </div>

        {/* Level indicator */}
        <div className="bg-indigo-900/40 border border-indigo-500/25 rounded-full px-5 py-1.5 text-xs font-bold text-cyan-300 flex items-center gap-2">
          <span>🎮</span>
          <span>
            {language === 'ur'
              ? `لیول ${currentLevel}: ${currentLevel === 1 ? 'AI کیا ہے؟' : currentLevel === 2 ? 'AI ایجنٹس' : 'ملٹی ایجنٹ ٹیمیں'}`
              : `Mission ${currentLevel}: ${currentLevel === 1 ? 'What is AI?' : currentLevel === 2 ? 'AI Agents' : 'Multi-Agent Teams'}`}
          </span>
        </div>

        {/* Level Rank & Badge */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">Rank:</span>
          <span className="text-xs font-bold text-cyan-100">{title}</span>
          <span className="text-slate-700">|</span>
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">Score:</span>
          <span className="text-xs font-bold text-cyan-100">{score} BP</span>
        </div>
      </header>

      {/* 2. Main Content Grid - Holds Sidebar, Flow, Simulation */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Holds Quest description, checklist and block selectors */}
        <div className="w-72 bg-slate-950/95 border-r border-indigo-950/45 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-10">
          {/* Quest Log Box */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-3.5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] text-cyan-400 font-extrabold uppercase tracking-wider">
              {translations[language].quest_log}
            </span>
            <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans">
              {currentLevel === 1 && translations[language].welcome_level_1}
              {currentLevel === 2 && translations[language].welcome_level_2}
              {currentLevel === 3 && translations[language].welcome_level_3}
            </p>
          </div>

          {/* Checklist Box */}
          <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-3.5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[11px] text-emerald-400 font-extrabold uppercase tracking-wider">
              {language === 'ur' ? 'چیک لسٹ' : 'Checklist'}
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              {currentLevel === 1 && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{hasInput && hasOutput && llmNodes.length >= 1 ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${hasInput && hasOutput && llmNodes.length >= 1 ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_blocks}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{inputToLLM ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${inputToLLM ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_ears_brain}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{llmToOutput ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${llmToOutput ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_brain_mouth}
                    </span>
                  </div>
                </>
              )}
              {currentLevel === 2 && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{inputToLLM && llmToOutput ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${inputToLLM && llmToOutput ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_ears_brain_mouth}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{toolToLLM ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${toolToLLM ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_tool_brain}
                    </span>
                  </div>
                </>
              )}
              {currentLevel === 3 && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{inputToLLM ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${inputToLLM ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_ears_brain1}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{llm1ToLLM2 ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${llm1ToLLM2 ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_brain1_brain2}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{llm2ToOutput ? '✅' : '⚪'}</span>
                    <span className={`font-semibold ${llm2ToOutput ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {translations[language].chk_brain2_mouth}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <hr className="border-slate-800/80 my-1" />

          {/* Block Selector Blocks - Styled for high readability with soft color badges */}
          <div className="flex flex-col gap-3">
            <h2 className="text-cyan-400 font-bold text-xs uppercase tracking-wider font-sans text-center">
              {language === 'ur' ? 'روبوٹ کے حصے' : 'Robot Parts'}
            </h2>
            
            {/* Ears */}
            {currentLevel >= 1 && (
              <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "input_node")} 
                className="p-3 bg-slate-900 border-2 border-amber-500/85 hover:bg-slate-850 cursor-grab rounded-2xl font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-3 transform hover:-translate-y-0.5 active:cursor-grabbing text-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-base shrink-0">👂</div>
                <span>{language === 'ur' ? 'کان (Ears)' : 'Ears (Input)'}</span>
              </div>
            )}

            {/* Brain */}
            {currentLevel >= 1 && (
              <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "llm_node")} 
                className="p-3 bg-slate-900 border-2 border-indigo-500/85 hover:bg-slate-850 cursor-grab rounded-2xl font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-3 transform hover:-translate-y-0.5 active:cursor-grabbing text-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-base shrink-0">🧠</div>
                <span>{language === 'ur' ? 'دماغ (Brain)' : 'Brain Core (LLM)'}</span>
              </div>
            )}

            {/* Tool */}
            {currentLevel >= 2 && (
              <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "tool_node")} 
                className="p-3 bg-slate-900 border-2 border-emerald-500/85 hover:bg-slate-850 cursor-grab rounded-2xl font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-3 transform hover:-translate-y-0.5 active:cursor-grabbing text-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base shrink-0">🛠️</div>
                <span>{language === 'ur' ? 'ٹول (Tool)' : 'Mod Chip (Tool)'}</span>
              </div>
            )}

            {/* Mouth */}
            {currentLevel >= 1 && (
              <div 
                draggable 
                onDragStart={(e) => e.dataTransfer.setData("application/reactflow", "output_node")} 
                className="p-3 bg-slate-900 border-2 border-pink-500/85 hover:bg-slate-850 cursor-grab rounded-2xl font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-3 transform hover:-translate-y-0.5 active:cursor-grabbing text-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-base shrink-0">🗣️</div>
                <span>{language === 'ur' ? 'منہ (Mouth)' : 'Mouth (Output)'}</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-800/80">
              <button onClick={handlePublish} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 px-4 rounded-2xl tracking-wide text-xs transition-colors shadow-lg uppercase">
                {language === 'ur' ? '🚀 ایپ شیئر کریں' : '🚀 Share App'}
              </button>
          </div>
        </div>

        {/* Center: React Flow Canvas */}
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

          {/* Floating Playful Run Button - appears when checklist is ready */}
          {isReady && !isSimChamberOpen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom duration-300">
              <button
                onClick={() => setIsSimChamberOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wider uppercase rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-yellow-300 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 animate-pulse"
              >
                <span className="text-lg">⚡</span>
                <span>{language === 'ur' ? 'سیمولیشن چلائیں' : 'Run Simulation'}</span>
                <span className="text-lg">⚡</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar: Simulation Chamber (Rendered conditionally) */}
        {isSimChamberOpen && (
          <SimulationChamber 
            onExecute={handleExecute} 
            isRunning={isRunning} 
            resultMsg={resultMsg} 
            errorMsg={errorMsg} 
            onClear={() => {}} 
            onClose={() => setIsSimChamberOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkspaceCanvasWrapper() {
  const screen = useQuestStore((state) => state.screen);
  return (
    <ReactFlowProvider>
      {screen === "hub" ? <LevelHub /> : <WorkspaceCanvas />}
    </ReactFlowProvider>
  );
}
