import express from "express";
import axios from "axios";

const app = express();
app.use(express.json())

const tools = [
  {
    id: 1,
    name: "add_numbers",
    function: (input: number[]) => (input.reduce((a, b) => a + b)),
    description: "for getting the addition of two numbers",
  },
  {
    id: 2,
    name: "subtract_numbers",
    function: (input: number[]) => (input.reduce((a, b) => a - b)),
    description: "for getting the subtraction of two numbers",
  },
  {
    id: 3,
    name: "divide_numbers",
    function: (input: number[]) => (input.reduce((a, b) => a - b)),
    description: "for getting the division of two numbers",
  },
  {
    id: 4,
    name: "multipy_numbers",
    function: (input: number[]) => (input.reduce((a, b) => a - b)),
    description: "for getting the multiplication of two numbers",
  },
]


const defined_tools = `
  <AVAILABLE_TOOLS>
    ${JSON.stringify(tools)}
  <AVAILABLE_TOOLS>
`;

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const messageToSend = `
    ${defined_tools},
    <USER_QUERY>
      ${message.trim()}
    <USER_QUERY>
  `

  const llmResponse = await axios.post("http://localhost:4001/llm", 
    { message: messageToSend }
  );

  console.log("llmResponse", llmResponse.data)

  res.json({ message: "ok" })
})

app.listen(4000, () => console.log("code is running at 4000"))