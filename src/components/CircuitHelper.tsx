import React, { useEffect, useState, useRef } from 'react';
import { useQuestStore } from '../store/questStore';
import { useLiveAudio } from './CircuitVoicePlayer';
import { useCircuitInitialization } from '../hooks/useCircuitInitialization';
import { translations } from '../constants/translations';

export default function CircuitHelper() {
  const { message, isComplete, score, title, language, setLanguage } = useQuestStore();
  const [hasInteracted, setHasInteracted] = useState(false);
  const prevMessageRef = useRef(message);

  const { isConnected, hasError, isSpeaking, speak, initAudio, fallbackSpeak } = useLiveAudio();

  useCircuitInitialization((text) => {
    // Handled by handleInteract
  });

  useEffect(() => {
    if (message && message !== prevMessageRef.current) {
      prevMessageRef.current = message;
      if (hasInteracted) {
        if (hasError || (!isConnected && hasInteracted)) {
          // Fallback to TTS if Live API is unavailable
          fallbackSpeak(message);
        } else {
          speak(message);
        }
      }
    }
  }, [message, hasInteracted, speak, hasError, isConnected, language, fallbackSpeak]);

  const handleInteract = () => {
    const welcomeMsg = translations[language].welcomeMsg;
    if (!hasInteracted) {
      setHasInteracted(true);
      initAudio();
      
      if (hasError) {
        fallbackSpeak(welcomeMsg);
      } else {
        speak(welcomeMsg);
      }
    } else if (message) {
      if (hasError || !isConnected) {
        fallbackSpeak(message);
      } else {
        speak(message);
      }
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'ur', e: React.MouseEvent) => {
    e.stopPropagation();
    setLanguage(newLang);
    initAudio();

    const activeMsg = message || translations[newLang].welcomeMsg;
    setHasInteracted(true);
    
    if (hasError || !isConnected) {
      fallbackSpeak(activeMsg);
    } else {
      speak(activeMsg);
    }
  };

  return (
    <div 
      className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-4 cursor-pointer"
      onClick={handleInteract}
    >
      {/* Language Switcher */}
      <div className="mr-6 flex gap-2">
        <button 
          onClick={(e) => handleLanguageChange('en', e)}
          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border tracking-wider transition-all duration-200 ${
            language === 'en' 
              ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
              : 'bg-slate-900/60 text-slate-400 border-slate-700/50 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          🗣️ English
        </button>
        <button 
          onClick={(e) => handleLanguageChange('ur', e)}
          className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border tracking-wider transition-all duration-200 ${
            language === 'ur' 
              ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
              : 'bg-slate-900/60 text-slate-400 border-slate-700/50 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          🗣️ اردو
        </button>
      </div>

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
              {message || (language === 'ur' ? "روبوٹ دوست شروع کرنے کے لیے دبائیں!" : "Click me to initialize comms!")}
            </p>
            {!hasInteracted && (
              <p className="text-[10px] text-cyan-500/70 mt-2 uppercase tracking-wider animate-pulse">
                {language === 'ur' ? "آواز شروع کرنے کے لیے کلک کریں!" : "Click me to enable audio!"}
              </p>
            )}
            {!isConnected && hasInteracted && !hasError && (
              <p className="text-[10px] text-amber-500/70 mt-2 uppercase tracking-wider animate-pulse">
                {language === 'ur' ? "رابطہ قائم ہو رہا ہے..." : "Connecting to Live Audio..."}
              </p>
            )}
            {hasError && hasInteracted && (
              <p className="text-[10px] text-emerald-500/70 mt-2 uppercase tracking-wider">
                {language === 'ur' ? "کمپیوٹر کی آواز استعمال ہو رہی ہے۔" : "Using built-in companion voice."}
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
