# 🤖 AgentCraft

> **Build, wire, and deploy your own AI minions!**  
> AgentCraft is an interactive, drag-and-drop game and simulator designed to teach kids (and kids at heart) AI and Agentic AI concepts. Connect sensors, brains, and tools to construct fully functional autonomous agents!

---

## 🚀 Key Features

* **Drag-and-Drop Editor**: Powered by `@xyflow/react` (React Flow) for creating, connecting, and configuring custom AI pipelines.
* **Brain Core Customization**: Adjust the **Overclock (Chaos)** level to shift your agent between a structured logician, a creative writer, or a chaotic companion.
* **Mod Chips (Tool Integration)**: Connect tools like the **Web Scanner** or **Calculator** directly into the Brain Core to give your agent real-time superpowers.
* **Simulation Chamber**: An interactive console where you can chat with your agent and see modular tools execute in real-time with visual effects.
* **Virtual Arcade Cabinets**: Publish your custom agents to retro-themed virtual arcade machines to share with friends, featuring custom voice output configurations!
* **Circuit Companion**: "Circuit" is a gentle, expressive AI companion that guides you through the quests with live vocal narration powered by the **Gemini Live API**.

---

## ⚡ Game Progression & Quests

Earn **Brain Power (BP)** points as you wire up your agent's neural circuit:
- **AI Apprentice** (0 - 150 BP): Learning the basics of input, reasoning, and output.
- **Circuit Wizard** (150 - 300 BP): Creating functional agents with custom core directives.
- **Logic Grandmaster** (300+ BP): Building advanced agents equipped with multiple Mod Chips!

---

## 🛠️ Technical Stack

- **Frontend**: React 18, Vite, Zustand (State Management), Tailwind CSS, `@xyflow/react`, Lucide Icons.
- **Backend**: Express (handling executor logic and static assets), `ws` (WebSockets for real-time audio streams).
- **AI Integration**: Powered by `@google/genai` utilizing:
  - `gemini-2.5-flash` for agent reasoning & execution.
  - `gemini-3.1-flash-live-preview` for high-quality, real-time vocal narration with the expressive "Puck" prebuilt voice configuration.

---

## 💻 Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v20.6.0+ recommended for native env support).

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your Gemini API key:
   ```text
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` to start crafting agents!

---

## 🛡️ License
This project is open-source and available under the MIT License.
