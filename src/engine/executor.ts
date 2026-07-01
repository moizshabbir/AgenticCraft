const mockToolsOpenAI: Record<string, any> = {
    calculator: {
        type: "function",
        function: {
            name: "calculator",
            description: "Evaluates a math expression.",
            parameters: {
                type: "object",
                properties: { expression: { type: "string" } },
                required: ["expression"]
            }
        }
    },
    google_search: {
        type: "function",
        function: {
            name: "google_search",
            description: "Search the web.",
            parameters: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"]
            }
        }
    }
};

const toolImpl: Record<string, any> = {
    calculator: (args: any) => { try { return { result: eval(args.expression) }; } catch { return { error: "err" }; } },
    google_search: (args: any) => ({ results: [{ title: "Search result", snippet: "Awesome stuff about " + args.query }] })
};

export async function executeAgentGraph(graph: any, userInputValue: string) {
    const { nodes, edges } = graph;
    
    // Find input node
    const inputNode = nodes.find((n: any) => n.type === "input_node");
    if (!inputNode) {
        return { text: "Error: Please add an Ears (Input) block!" };
    }

    const outputNode = nodes.find((n: any) => n.type === "output_node");
    if (!outputNode) {
        return { text: "Error: Please add a Mouth (Output) block!" };
    }

    const nodeOutputs = new Map<string, string>();
    nodeOutputs.set(inputNode.id, userInputValue);

    const usedTools: string[] = [];

    // Simple topological execution queue
    const queue = [...nodes.filter((n: any) => n.type !== "input_node")];
    let iterations = 0;
    const maxIterations = 50;

    const apiKey = process.env.OPENAI_API_KEY || "";
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const modelName = process.env.OPENAI_MODEL_NAME || "gpt-4o-mini";

    while (queue.length > 0 && iterations < maxIterations) {
        iterations++;
        // Find a node that has all its incoming dependencies resolved
        let readyNodeIndex = queue.findIndex(node => {
            const incomingEdges = edges.filter((e: any) => e.target === node.id);
            // If all source nodes of incoming edges have outputs, this node is ready
            return incomingEdges.every((e: any) => nodeOutputs.has(e.source));
        });

        if (readyNodeIndex === -1) {
            // No node is ready (circular dependency or disconnected graph)
            break;
        }

        const node = queue.splice(readyNodeIndex, 1)[0];
        
        // Find incoming inputs
        const incomingEdges = edges.filter((e: any) => e.target === node.id);
        const inputs = incomingEdges.map((e: any) => nodeOutputs.get(e.source) || "").filter(Boolean);
        const combinedInput = inputs.join("\n");

        if (node.type === "llm_node") {
            let systemInstruction = node.data.prompt || "";
            const creativity = node.data.creativity ?? 0.7;

            // Find connected tools for this specific LLM node
            const tools: any[] = [];
            const connectedTools = edges.filter((e: any) => e.target === node.id)
                .map((e: any) => nodes.find((n: any) => n.id === e.source && n.type === "tool_node"))
                .filter(Boolean);

            for (const toolNode of connectedTools) {
                if (toolNode.data.tool && mockToolsOpenAI[toolNode.data.tool]) {
                    tools.push(mockToolsOpenAI[toolNode.data.tool]);
                }
            }

            // Construct final user prompt
            let userPrompt = combinedInput;
            if (systemInstruction.includes("{input}")) {
                userPrompt = systemInstruction.replace("{input}", combinedInput);
                systemInstruction = "You are a smart AI agent. Follow the instructions.";
            }

            const messages: any[] = [];
            if (systemInstruction) {
                messages.push({ role: "system", content: systemInstruction });
            }
            messages.push({ role: "user", content: userPrompt });

            try {
                let callCount = 0;
                let finish = false;
                let responseContent = "No output";

                while (!finish && callCount < 4) {
                    const body: any = {
                        model: modelName,
                        messages: messages,
                        temperature: creativity
                    };
                    if (tools.length > 0) {
                        body.tools = tools;
                        body.tool_choice = "auto";
                    }

                    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(body)
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
                    }

                    const resData = await response.json();
                    const choice = resData.choices?.[0];
                    if (!choice) {
                        throw new Error("No response choices returned by model");
                    }

                    const assistantMessage = choice.message;
                    messages.push(assistantMessage);

                    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                        callCount++;
                        for (const toolCall of assistantMessage.tool_calls) {
                            const funcName = toolCall.function.name;
                            let args = {};
                            try {
                                args = JSON.parse(toolCall.function.arguments);
                            } catch (e) {
                                args = { expression: toolCall.function.arguments, query: toolCall.function.arguments };
                            }
                            
                            usedTools.push(funcName);
                            const result = toolImpl[funcName] ? toolImpl[funcName](args) : { error: "Not found" };
                            
                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                name: funcName,
                                content: JSON.stringify(result)
                            });
                        }
                    } else {
                        responseContent = assistantMessage.content || "No output";
                        finish = true;
                    }
                }

                nodeOutputs.set(node.id, responseContent);
            } catch (e: any) {
                nodeOutputs.set(node.id, "Error: " + e.message);
            }

        } else if (node.type === "output_node") {
            nodeOutputs.set(node.id, combinedInput);
        }
    }

    const finalOutput = nodeOutputs.get(outputNode.id) || "No output received. Make sure all nodes are correctly connected!";
    return { text: finalOutput, usedTools };
}
