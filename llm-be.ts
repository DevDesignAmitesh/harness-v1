import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json())

const client = new OpenAI();

const system_prompt = `
  you are very helpful,
  answer user's questions breifly,
  use given tools when you need them.
  if not able to understand the user query tell them honestly,
  returns the response in the below strict response

  if want to use any tools
  <OUTPUT>
    [{ toolId: string, params: { key1: val2, key2: val2 } }] // tools you used 
  <OUTPUT>
  
  if not tool used
  <OUTPUT>
    { response: "your_response_here" }
  <OUTPUT>
`

app.post("/llm", async (req, res) => {
  const { message } = req.body;
  
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
        content: message.trim()
      },
    ]
  });
  
  console.log(response.output_text);
  res.json({ message: response.output_text })
})

app.listen(4001, () => console.log("code is running at 4001"))