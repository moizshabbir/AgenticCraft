import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { executeAgentGraph } from "./src/engine/executor";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.post("/api/execute", async (req, res) => {
    try {
      const result = await executeAgentGraph(req.body.graph, req.body.userInputValue);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const publishedApps = new Map<string, any>();
  app.post("/api/publish", (req, res) => {
    const id = Math.random().toString(36).substring(2, 9);
    publishedApps.set(id, { title: req.body.title, graph: req.body.graph });
    res.json({ id });
  });

  app.get("/api/app/:id", (req, res) => {
    const appData = publishedApps.get(req.params.id);
    if (!appData) return res.status(404).json({ error: "App not found" });
    res.json(appData);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const server = app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

  // Setup WebSocket for Gemini Live API
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs) => {
    console.log("New WebSocket connection to /live");
    console.log("Has API key?", !!process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY?.substring(0, 5));
    try {
      console.log("Connecting to Gemini Live API...");
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: {
            parts: [{ text: "You are Circuit, a sweet, gentle, ultra-natural AI companion for kids. The user will provide you with a script. You MUST read the script EXACTLY as written, word for word, with a warm, energetic, and natural voice. Do NOT add any conversational filler like 'Okay' or 'Sure'. ONLY speak the provided script." }]
          },
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              const parts = message.serverContent.modelTurn.parts || [];
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  const audio = part.inlineData.data;
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.send(JSON.stringify({ audio }));
                  }
                }
              }
            }
            if (message.serverContent?.interrupted && clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: (event) => {
            console.log("Gemini Live session closed", event);
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ error: "Live API closed: " + event?.reason }));
              clientWs.close();
            }
          },
          onerror: (error) => {
            console.log("Gemini Live API error:", error);
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ error: "Live API error" }));
            }
          }
        },
      });
      console.log("Connected to Gemini Live API!");

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          console.log("Received WS message from client:", msg);
          if (msg.text) {
            session.sendRealtimeInput([
              { text: `Script to read: "${msg.text}"` }
            ]);
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      });

      clientWs.on("close", () => {
        console.log("Client WS closed");
        session.close();
      });
    } catch (err) {
      console.error("Gemini Live connection error:", err);
      import("fs").then(fs => fs.appendFileSync("error.log", err.toString() + "\\n" + (err.stack || "") + "\\n"));
      clientWs.close();
    }
  });
}
startServer();
