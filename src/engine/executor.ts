import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI() {
    if (!aiClient) aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return aiClient;
}

const mockTools: Record<string, any> = {
    calculator: {
        name: "calculator",
        description: "Evaluates a math expression.",
        parameters: { type: Type.OBJECT, properties: { expression: { type: Type.STRING } }, required: ["expression"] }
    },
    google_search: {
        name: "google_search",
        description: "Search the web.",
        parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ["query"] }
    }
};

const toolImpl: Record<string, any> = {
    calculator: (args: any) => { try { return { result: eval(args.expression) }; } catch { return { error: "err" }; } },
    google_search: (args: any) => ({ results: [{ title: "Search result", snippet: "Awesome stuff about " + args.query }] })
};

export async function executeAgentGraph(graph: any, userInputValue: string) {
    const { nodes, edges } = graph;
    const inputNode = nodes.find((n: any) => n.type === "input_node");
    const outputNode = nodes.find((n: any) => n.type === "output_node");
    const brain = nodes.find((n: any) => n.type === "llm_node");

    if (!brain) return { text: "No Brain block found." };

    let systemInstruction = brain.data.prompt || "";
    const tools: any[] = [];
    
    // Check connected tools
    const connectedTools = edges.filter((e: any) => e.target === brain.id).map((e: any) => nodes.find((n: any) => n.id === e.source && n.type === "tool_node")).filter(Boolean);
    for (const toolNode of connectedTools) {
        if (toolNode.data.tool && mockTools[toolNode.data.tool]) {
            tools.push({ functionDeclarations: [mockTools[toolNode.data.tool]] });
        }
    }

    const config: any = {
        temperature: brain.data.creativity ?? 0.7,
        systemInstruction: systemInstruction.trim() || undefined,
        tools: tools.length > 0 ? tools : undefined,
    };

    try {
        const ai = getAI();
        const chat = ai.chats.create({ model: "gemini-2.5-flash", config });
        let response = await chat.sendMessage({ message: userInputValue });
        let callCount = 0;
        const usedTools: string[] = [];

        while (response.functionCalls && response.functionCalls.length > 0 && callCount < 3) {
            callCount++;
            const call = response.functionCalls[0];
            usedTools.push(call.name);
            const resData = toolImpl[call.name] ? toolImpl[call.name](call.args) : { error: "Not found" };
            response = await chat.sendMessage({ message: [{ functionResponse: { name: call.name, response: resData } }] });
        }

        return { text: response.text || "No output", usedTools };
    } catch (e: any) {
        return { text: "Error: " + e.message };
    }
}
