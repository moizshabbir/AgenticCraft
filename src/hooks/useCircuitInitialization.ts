import { useEffect, useRef } from 'react';

const WELCOME_SCRIPT = `Welcome Commander! This is AgentCraft! You're going to build a super-smart minion that actually thinks for itself. 
On your left is the Block Library—those are your tools! Drag blocks into the Canvas in the middle to build your logic chain.
When you connect a Data Uplink to a Brain Core, you earn Brain Power points! You can test it all out in the Simulation Chamber on the right. 
Ready to make something awesome to trick and amaze your friends? Let's go!`;

export function useCircuitInitialization(speak: (text: string) => void) {
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (!hasSpoken.current) {
      // Delay slightly to ensure WebSocket connects
      const timer = setTimeout(() => {
        speak(WELCOME_SCRIPT);
        hasSpoken.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [speak]);
}
