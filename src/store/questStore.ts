import { create } from 'zustand';
import { translations } from '../constants/translations';

export type Level = 1 | 2 | 3;

interface QuestState {
  currentLevel: Level;
  message: string;
  isComplete: boolean;
  score: number;
  title: string;
  language: 'en' | 'ur';
  screen: 'hub' | 'canvas';
  setScreen: (screen: 'hub' | 'canvas') => void;
  setLanguage: (lang: 'en' | 'ur') => void;
  setLevel: (level: Level) => void;
  evaluateGraph: (nodes: any[], edges: any[]) => void;
  triggerBlockDescription: (nodeType: string) => void;
  completeLevel: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  currentLevel: 1,
  message: "",
  isComplete: false,
  score: 0,
  title: "AI Apprentice",
  language: 'en',
  screen: 'hub', // Default to level selector first

  setScreen: (screen: 'hub' | 'canvas') => set({ screen }),

  setLanguage: (lang: 'en' | 'ur') => {
    const state = get();
    const t = translations[lang];

    // Determine title
    let newTitle = t.title_apprentice;
    if (state.currentLevel === 2) newTitle = t.title_wizard;
    if (state.currentLevel === 3) newTitle = t.title_grandmaster;

    // Translate current message
    let newMessage = state.message;
    const prevT = translations[state.language];

    if (state.message === prevT.welcomeMsg || state.message === prevT.welcome_level_1) {
      newMessage = t.welcome_level_1;
    } else if (state.message === prevT.welcome_level_2) {
      newMessage = t.welcome_level_2;
    } else if (state.message === prevT.welcome_level_3) {
      newMessage = t.welcome_level_3;
    } else if (state.message === prevT.input_node) {
      newMessage = t.input_node;
    } else if (state.message === prevT.llm_node) {
      newMessage = t.llm_node;
    } else if (state.message === prevT.tool_node) {
      newMessage = t.tool_node;
    } else if (state.message === prevT.output_node) {
      newMessage = t.output_node;
    } else if (state.message === prevT.level_1_instruction) {
      newMessage = t.level_1_instruction;
    } else if (state.message === prevT.level_2_instruction) {
      newMessage = t.level_2_instruction;
    } else if (state.message === prevT.level_3_instruction) {
      newMessage = t.level_3_instruction;
    } else if (state.message === prevT.level_1_complete) {
      newMessage = t.level_1_complete;
    } else if (state.message === prevT.level_2_complete) {
      newMessage = t.level_2_complete;
    } else if (state.message === prevT.level_3_complete) {
      newMessage = t.level_3_complete;
    }

    set({ language: lang, title: newTitle, message: newMessage });
  },

  setLevel: (level: Level) => {
    const state = get();
    const t = translations[state.language];
    
    let newTitle = t.title_apprentice;
    if (level === 2) newTitle = t.title_wizard;
    if (level === 3) newTitle = t.title_grandmaster;

    const welcomeMsg = level === 1 ? t.welcome_level_1 :
                       level === 2 ? t.welcome_level_2 : t.welcome_level_3;

    set({
      currentLevel: level,
      title: newTitle,
      isComplete: false,
      message: welcomeMsg,
      screen: 'canvas' // Go to canvas automatically
    });
  },

  triggerBlockDescription: (nodeType: string) => {
    const state = get();
    const t = translations[state.language];
    const desc = nodeType === 'input_node' ? t.input_node :
                 nodeType === 'llm_node' ? t.llm_node :
                 nodeType === 'tool_node' ? t.tool_node :
                 nodeType === 'output_node' ? t.output_node : '';
    if (desc) {
      set({ message: desc });
    }
  },

  evaluateGraph: (nodes, edges) => {
    const state = get();
    const t = translations[state.language];

    if (state.isComplete) return; // Wait for execution to trigger completion message

    const hasInput = nodes.some(n => n.type === 'input_node');
    const hasOutput = nodes.some(n => n.type === 'output_node');
    const llmNodes = nodes.filter(n => n.type === 'llm_node');
    const toolNodes = nodes.filter(n => n.type === 'tool_node');

    if (state.currentLevel === 1) {
      // Level 1: Input -> LLM -> Output
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

      if (hasInput && hasOutput && llmNodes.length >= 1 && inputToLLM && llmToOutput) {
        set({ message: t.level_1_instruction });
      }
    } else if (state.currentLevel === 2) {
      // Level 2: Input -> LLM -> Output and Tool -> LLM
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

      if (hasInput && hasOutput && llmNodes.length >= 1 && toolNodes.length >= 1 && inputToLLM && llmToOutput && toolToLLM) {
        set({ message: t.level_2_instruction });
      }
    } else if (state.currentLevel === 3) {
      // Level 3: Input -> LLM1 -> LLM2 -> Output (Multi-Agent collaboration)
      const inputToLLM1 = edges.some(e => {
        const src = nodes.find(n => n.id === e.source);
        const tgt = nodes.find(n => n.id === e.target);
        return src?.type === 'input_node' && tgt?.type === 'llm_node';
      });

      const llm1ToLLM2 = edges.some(e => {
        const src = nodes.find(n => n.id === e.source);
        const tgt = nodes.find(n => n.id === e.target);
        return src?.type === 'llm_node' && tgt?.type === 'llm_node';
      });

      const llm2ToOutput = edges.some(e => {
        const src = nodes.find(n => n.id === e.source);
        const tgt = nodes.find(n => n.id === e.target);
        return src?.type === 'llm_node' && tgt?.type === 'output_node';
      });

      if (hasInput && hasOutput && llmNodes.length >= 2 && inputToLLM1 && llm1ToLLM2 && llm2ToOutput) {
        set({ message: t.level_3_instruction });
      }
    }
  },

  completeLevel: () => {
    const state = get();
    if (state.isComplete) return;

    const t = translations[state.language];
    const pointsAwarded = state.currentLevel * 100;
    const newScore = state.score + pointsAwarded;
    const completedMsg = state.currentLevel === 1 ? t.level_1_complete :
                         state.currentLevel === 2 ? t.level_2_complete : t.level_3_complete;

    set({
      score: newScore,
      isComplete: true,
      message: completedMsg
    });
  }
}));
