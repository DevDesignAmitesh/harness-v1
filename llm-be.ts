import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json())

const client = new OpenAI();

const system_prompt = `
  you are very helpful,
  answer user's questions breifly,

  if user any questions related to the <AVAILABLE_TOOLS> then use tools DO NOT ANSWER BY YOURSELF

  return the response in the below STRICT response

  if you have used any tools use this structure to return the response
  {
    output: {
      toolRequired: [{ toolId: string, params: [// asked by the user] }] // tools you used 
    }
  }
  
  if you have not used any tool then use this strucutre to return the response
  {
    output: {
      { response: "your_response_here" }
    }
  }

  you can also get the message after using some <AVAILABLE_TOOLS> then sumarize the message and give a direct answer of the 
  user's query to the user according to the <TOOL_USED> <TOOL_RESPONSE> and user's query
`;

app.post("/llm", async (req, res) => {
  const { message } = req.body as { message: any[] }
  
  console.log("message from api-backend", message);

  
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
      {
        role: "system",
        content: system_prompt
      },
      {
        role: "user",
        content: JSON.stringify(message)
      },
    ]
  });
  
  console.log(response.output_text);
  res.json({ message: response.output_text })
})

app.listen(4001, () => console.log("code is running at 4001"))