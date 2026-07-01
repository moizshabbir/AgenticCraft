import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuestStore } from '../store/questStore';

export function useLiveAudio() {
  const language = useQuestStore(state => state.language);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const fallbackSpeak = useCallback(async (text: string) => {
    // Stop currently active source
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch (e) {}
      activeSourceRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (language === 'ur') {
      try {
        setIsSpeaking(true);
        const audioUrl = `/api/tts?lang=ur&text=${encodeURIComponent(text)}`;
        const response = await fetch(audioUrl);
        if (!response.ok) {
          throw new Error(`TTS server returned ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Lazy initialize audio context
        if (!audioCtxRef.current) {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioCtxRef.current = new AudioContext();
        }
        const audioCtx = audioCtxRef.current;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        audioCtx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
          // Double-check we haven't started another play in the meantime
          if (activeSourceRef.current) {
            try { activeSourceRef.current.stop(); } catch (e) {}
          }

          const source = audioCtx.createBufferSource();
          source.buffer = decodedBuffer;
          source.connect(audioCtx.destination);
          activeSourceRef.current = source;

          source.onended = () => {
            if (activeSourceRef.current === source) {
              activeSourceRef.current = null;
              setIsSpeaking(false);
            }
          };

          source.start(0);
        }, (decodeErr) => {
          console.error("Audio decoding failed:", decodeErr);
          setIsSpeaking(false);
        });
      } catch (err) {
        console.error("Failed to play local TTS via Web Audio:", err);
        setIsSpeaking(false);
      }
    } else {
      if (!window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.pitch = 1.45;
      utterance.rate = 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    fallbackSpeak(text);
  }, [fallbackSpeak]);

  const initAudio = useCallback(async () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  return { 
    isConnected: true, 
    hasError: false, 
    isSpeaking, 
    speak, 
    initAudio, 
    fallbackSpeak 
  };
}
