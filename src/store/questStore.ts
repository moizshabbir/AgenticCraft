import { create } from 'zustand';

export type QuestStep = 1 | 2 | 3;

interface QuestState {
  currentStep: QuestStep;
  message: string;
  isComplete: boolean;
  score: number;
  title: string;
  evaluateGraph: (nodes: any[], edges: any[]) => void;
  triggerBlockDescription: (nodeType: string) => void;
}

const BLOCK_DESCRIPTIONS: Record<string, string> = {
  'input_node': "Ooh, a Data Uplink! This is like your bot's ears. It listens to whatever commands your friends type in!",
  'llm_node': "Awesome, you just gave your bot a brain! This core processes thoughts. Look at the creativity slider—turn it up if you want a chaotic, funny bot, or down if you want a serious scientist!",
  'tool_node': "A Mod Chip! You're giving your bot superpowers. Snapping this Web Scanner in means your bot can instantly read the entire live internet to answer questions!",
  'output_node': "Perfect, the Comms Link! This connects your bot's brain back to the Simulation Chamber so it can talk back to you!"
};

export const useQuestStore = create<QuestState>((set, get) => ({
  currentStep: 1,
  message: "",
  isComplete: false,
  score: 0,
  title: "AI Apprentice",
  triggerBlockDescription: (nodeType: string) => {
    const desc = BLOCK_DESCRIPTIONS[nodeType];
    if (desc) {
      set({ message: desc });
    }
  },
  evaluateGraph: (nodes, edges) => {
    const state = get();
    
    const hasLLM = nodes.some(n => n.type === 'llm_node');
    const hasInput = nodes.some(n => n.type === 'input_node');
    const hasOutput = nodes.some(n => n.type === 'output_node');
    
    const inputToLLM = edges.some(e => {
      const sourceNode = nodes.find(n => n.id === e.source);
      const targetNode = nodes.find(n => n.id === e.target);
      return sourceNode?.type === 'input_node' && targetNode?.type === 'llm_node';
    });

    const llmToOutput = edges.some(e => {
      const sourceNode = nodes.find(n => n.id === e.source);
      const targetNode = nodes.find(n => n.id === e.target);
      return sourceNode?.type === 'llm_node' && targetNode?.type === 'output_node';
    });

    const hasTool = nodes.some(n => n.type === 'tool_node');
    
    // Calculate Score
    let newScore = nodes.length * 10 + edges.length * 20;
    if (hasLLM) newScore += 50;
    if (inputToLLM && llmToOutput) newScore += 100;
    if (hasTool) newScore += 80;

    let newTitle = "AI Apprentice";
    if (newScore > 300) newTitle = "Logic Grandmaster";
    else if (newScore > 150) newTitle = "Circuit Wizard";

    let newMessage = state.message;
    let newStep = state.currentStep;
    let newComplete = state.isComplete;

    if (newTitle !== state.title && newScore > 150) {
      newMessage = `Wow! Your brain power score just spiked! You leveled up to ${newTitle}! You're getting good at this!`;
    } else if (!state.isComplete) {
      if (state.currentStep === 1 && hasLLM) {
        newStep = 2;
        newMessage = "Awesome! Now drag a 'Data Uplink' and connect it to your Brain Core!";
      } else if (state.currentStep === 2) {
        if (inputToLLM && hasOutput && llmToOutput) {
          newStep = 3;
          newComplete = true;
          newMessage = "Quest Complete! Your Agent is fully operational!";
        } else if (inputToLLM) {
          newMessage = "Great wiring! Now add a 'Comms Link' and connect the Brain Core to it to finish your circuit!";
        }
      }
    }

    set({
      score: newScore,
      title: newTitle,
      currentStep: newStep,
      message: newMessage,
      isComplete: newComplete
    });
  }
}));
