import React, { useEffect, useState, useRef } from 'react';
import { useQuestStore } from '../store/questStore';
import { useLiveAudio } from './CircuitVoicePlayer';
import { useCircuitInitialization } from '../hooks/useCircuitInitialization';

export default function CircuitHelper() {
  const { message, currentStep, isComplete, score, title } = useQuestStore();
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevMessageRef = useRef(message);

  const { isConnected, hasError, isSpeaking, speak, initAudio } = useLiveAudio();

  useCircuitInitialization((text) => {
    // Handled by handleInteract
  });

  const fallbackSpeak = useRef((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.4;
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
  });

  useEffect(() => {
    if (message && message !== prevMessageRef.current) {
      prevMessageRef.current = message;
      if (hasInteracted) {
        if (hasError || (!isConnected && hasInteracted)) {
          // Fallback to TTS if Live API is unavailable
          fallbackSpeak.current(message);
        } else {
          speak(message);
        }
      }
    }
  }, [message, hasInteracted, speak, hasError, isConnected]);

  const handleInteract = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      initAudio();
      
      const welcomeMsg = "Welcome Commander! This is AgentCraft! You're going to build a super-smart minion that actually thinks for itself. On your left is the Block Library—those are your tools! Drag blocks into the Canvas in the middle to build your logic chain. When you connect a Data Uplink to a Brain Core, you earn Brain Power points! You can test it all out in the Simulation Chamber on the right. Ready to make something awesome to trick and amaze your friends? Let's go!";
      
      if (hasError) {
        fallbackSpeak.current(welcomeMsg);
      } else {
        speak(welcomeMsg);
      }
    } else if (message) {
      if (hasError || !isConnected) {
        fallbackSpeak.current(message);
      } else {
        speak(message);
      }
    }
  };

  return (
    <div 
      className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-4 cursor-pointer"
      onClick={handleInteract}
    >
      {/* Score Badge */}
      <div className="mr-6 bg-cyan-950/80 border border-cyan-500/50 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
        <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">{title}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
        <span className="text-cyan-50 font-mono text-sm">{score} BP</span>
      </div>

      <div className="flex items-end gap-4">
        {/* Speech Bubble */}
        <div className="mb-4 max-w-[250px]">
          <div className="relative bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl rounded-br-sm p-4 shadow-[0_0_15px_rgba(6,182,212,0.3)] transform transition-all duration-300">
            <p className="text-sm font-mono text-cyan-50 font-medium leading-relaxed">
              {message || "Click me to initialize comms!"}
            </p>
            {!hasInteracted && (
              <p className="text-[10px] text-cyan-500/70 mt-2 uppercase tracking-wider animate-pulse">
                Click me to enable audio!
              </p>
            )}
            {!isConnected && hasInteracted && !hasError && (
              <p className="text-[10px] text-amber-500/70 mt-2 uppercase tracking-wider animate-pulse">
                Connecting to Live Audio...
              </p>
            )}
            {hasError && hasInteracted && (
              <p className="text-[10px] text-emerald-500/70 mt-2 uppercase tracking-wider">
                Using built-in companion voice.
              </p>
            )}
          </div>
        </div>

        {/* Circuit Avatar */}
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
          {/* Outer Glow / Halo */}
          <div 
            className={`absolute inset-0 rounded-full bg-cyan-500/20 blur-xl transition-all duration-300 ${
              isSpeaking ? 'scale-150 opacity-80 animate-pulse' : 'scale-100 opacity-40'
            }`}
          />
          
          {/* Main Body */}
          <div 
            className={`relative w-16 h-16 rounded-full border-[3px] border-cyan-400 bg-slate-950 flex items-center justify-center shadow-[inset_0_0_15px_rgba(6,182,212,0.5)] z-10 transition-transform duration-100 ${
              isSpeaking ? 'scale-110' : 'scale-100 animate-[bounce_3s_infinite_ease-in-out]'
            }`}
          >
            {/* Eye Visor */}
            <div className="w-10 h-4 bg-black rounded-full overflow-hidden border border-cyan-900 shadow-[inset_0_0_5px_#000]">
              <div 
                className={`h-full bg-cyan-400 rounded-full transition-all duration-75 ${
                  isSpeaking 
                    ? 'w-full opacity-100' 
                    : 'w-4 mx-auto opacity-70 animate-[ping_2s_infinite]'
                }`}
              />
            </div>

            {/* Success Flash */}
            {isComplete && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-50 pointer-events-none" />
            )}
          </div>

          {/* Floating Rings */}
          <div className="absolute inset-2 border border-cyan-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-0 border border-cyan-400/20 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
        </div>
      </div>
    </div>
  );
}
