import express from "express";
import axios from "axios";
import { TOOLS } from "./tools";

const app = express();
app.use(express.json());

export type Tools = {
  id: string;
  name: string;
  inputs_for_fn: unknown,
  function: (input: unknown) => unknown
  description: string;
};

type ToolLLMResponse = {
  toolId: string, 
  params: number[]
}

const defined_tools = `
  <AVAILABLE_TOOLS>
    ${JSON.stringify(TOOLS)}
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

  // context_messages.push(userMessage);

  // const llmResponse = await axios.post("http://localhost:4001/llm", {
  //   message: context_messages,
  // });

  // console.log("llmResponse", llmResponse.data)

  // res.json({ message: "ok" })
  
  let toolCalls = true;
  
  context_messages.push(userMessage);

  while(toolCalls) {
    
    const llmResponse = await axios.post("http://localhost:4001/llm", {
      message: context_messages,
    });
  
    console.log("llmResponse.data", llmResponse.data.message)
    
    const parsedLLmRespone = JSON.parse(llmResponse.data.message).output;

    console.log("parsedLLmRespone", parsedLLmRespone)
    
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
    
    const toolToCall = parsedLLmRespone.toolRequired as ToolLLMResponse
    
    console.log("toolToCall", toolToCall);

    context_messages.push(`
      <RESPONSE_FROM_ASSISTANT>
        ${JSON.stringify(parsedLLmRespone.toolRequired)}
      <RESPONSE_FROM_ASSISTANT>
      `)

    const existingTool = TOOLS.find((tl) => tl.id === toolToCall.toolId);
    if (!existingTool) continue;
    
    const toolResponse = existingTool.function(toolToCall.params);

    context_messages.push(`
      <TOOL_USED>  
        ${JSON.stringify(existingTool)}
      <TOOL_USED>  

      <TOOL_RESPONSE>
        ${JSON.stringify(toolResponse)}
      <TOOL_RESPONSE>
    `)
  }
});

app.listen(4000, () => console.log("code is running at 4000"));
