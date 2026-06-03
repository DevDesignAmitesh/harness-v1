import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

type Tools = {
  id: string;
  name: string;
  function: (input: number[]) => number
  description: string;
};

type ToolLLMResponse = {
  toolId: string, 
  params: number[]
}

const tools: Tools[] = [
  {
    id: "1",
    name: "add_numbers",
    function: (input: number[]) => input.reduce((a, b) => a + b),
    description: "for getting the addition of two numbers",
  },
  {
    id: "2",
    name: "subtract_numbers",
    function: (input: number[]) => input.reduce((a, b) => a - b),
    description: "for getting the subtraction of two numbers",
  },
  {
    id: "3",
    name: "divide_numbers",
    function: (input: number[]) => input.reduce((a, b) => a / b),
    description: "for getting the division of two numbers",
  },
  {
    id: "4",
    name: "multipy_numbers",
    function: (input: number[]) => input.reduce((a, b) => a * b),
    description: "for getting the multiplication of two numbers",
  },
];

const defined_tools = `
  <AVAILABLE_TOOLS>
    ${JSON.stringify(tools)}
  <AVAILABLE_TOOLS>
`;

let context_messages: any[] = []

context_messages.push(defined_tools);

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const userMessage = `
    <USER_QUERY>
      ${message}
    <USER_QUERY>
  `;

  let toolCalls = true;
  
  context_messages.push(userMessage);
  while(toolCalls) {
    
    const llmResponse = await axios.post("http://localhost:4001/llm", {
      message: context_messages,
    });
  
    const parsedLLmRespone = JSON.parse(llmResponse.data.message).output;
    
    if (parsedLLmRespone.response) {
      toolCalls = false;
      // context_messages = []
      context_messages.push(`
        <RESPONSE_FROM_ASSISTANT>
          ${JSON.stringify(parsedLLmRespone.response)}
        <RESPONSE_FROM_ASSISTANT>
        `)
      res.json({ message: parsedLLmRespone.response })
      break;
    }
    
    const toolToCall = parsedLLmRespone.toolRequired as ToolLLMResponse[];
    
    console.log("toolToCall", toolToCall);

    context_messages.push(`
      <RESPONSE_FROM_ASSISTANT>
        ${JSON.stringify(parsedLLmRespone.toolRequired)}
      <RESPONSE_FROM_ASSISTANT>
      `)

    for (const tool of toolToCall) {
      const existingTool = tools.find((tl) => tl.id === tool.toolId);
      if (!existingTool) continue;
      
      const toolResponse = existingTool.function(tool.params);

      context_messages.push(`
        <TOOL_USED>  
          ${tool}
        <TOOL_USED>  

        <TOOL_RESPONSE>
          ${toolResponse}
        <TOOL_RESPONSE>
      `)
    }
  }
});

app.listen(4000, () => console.log("code is running at 4000"));
