import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useQuestStore } from '../store/questStore';

// Convert base64 string to Float32Array (Gemini outputs 24kHz PCM)
function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const buffer = bytes.buffer;
  const int16Array = new Int16Array(buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

export function useLiveAudio() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const speakingTimeoutRef = useRef<number | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setHasError(false);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.error) {
        console.error("Live API Error:", msg.error);
        setIsConnected(false);
        setHasError(true);
        setIsSpeaking(false);
      }
      
      if (msg.audio) {
        initAudio();
        const audioCtx = audioCtxRef.current!;
        const float32Data = base64ToFloat32Array(msg.audio);
        const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.copyToChannel(float32Data, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        const currentTime = audioCtx.currentTime;
        if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05; // 50ms buffer
        }
        
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;

        setIsSpeaking(true);
        if (speakingTimeoutRef.current) {
          window.clearTimeout(speakingTimeoutRef.current);
        }
        
        // Wait until audio is fully played before setting isSpeaking to false
        const timeUntilEnd = (nextStartTimeRef.current - currentTime) * 1000;
        speakingTimeoutRef.current = window.setTimeout(() => {
          setIsSpeaking(false);
        }, timeUntilEnd);
      }
      
      if (msg.interrupted) {
        // Handle interruption (stop playback)
        nextStartTimeRef.current = 0;
        setIsSpeaking(false);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [initAudio]);

  const speak = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    } else {
      // Reconnect and send after a delay
      connect();
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ text }));
        }
      }, 1000);
    }
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (speakingTimeoutRef.current) {
        window.clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [connect]);

  return { isConnected, hasError, isSpeaking, speak, initAudio };
}
