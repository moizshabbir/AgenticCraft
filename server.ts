import "./src/utils/loadEnv";
import express from "express";
import path from "path";
import text2wav from "text2wav";
import { createServer as createViteServer } from "vite";
import { executeAgentGraph } from "./src/engine/executor";

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

  app.get("/api/tts", async (req, res) => {
    const text = req.query.text as string;
    const lang = (req.query.lang as string) || "ur";
    if (!text) {
      return res.status(400).json({ error: "Text parameter is required" });
    }

    // 1. Try local XTTS-v2 API server on port 8020
    const xttsUrl = "http://localhost:8020/tts_to_audio/";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s fast check

      const response = await fetch(xttsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          language: lang === "ur" ? "ur" : "en",
          speaker_wav: "female.wav"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "audio/wav");
        return res.send(Buffer.from(audioBuffer));
      }
    } catch (err: any) {
      // Local XTTS-v2 is not running
    }

    // 2. Try Free Google Translate TTS (Sweet, natural human voice, zero keys or setup needed)
    try {
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang === "ur" ? "ur" : "en"}&client=tw-ob&q=${encodeURIComponent(text)}`;
      const response = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
        }
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "audio/mpeg");
        return res.send(Buffer.from(audioBuffer));
      }
    } catch (err: any) {
      console.warn("Google Translate TTS failed, falling back to local Wasm synthesis.");
    }

    // 3. Offline Wasm fallback
    try {
      const options = {
        voice: lang === "ur" ? "ur" : "en",
        amplitude: 120, 
        pitch: lang === "ur" ? 75 : 80,   
        speed: 130   
      };
      const wavBuffer = await text2wav(text, options);
      res.setHeader("Content-Type", "audio/wav");
      res.send(Buffer.from(wavBuffer));
    } catch (err: any) {
      console.error("Local Wasm TTS failed:", err);
      res.status(500).json({ error: "Local TTS failed: " + err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
startServer();
