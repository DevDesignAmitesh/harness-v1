import fs from "fs";
import type { Tools } from "./api-be";

function readCurrentDir() {
  const data = fs.readdirSync(process.cwd())

  return {
    message: "read current dir successfull",
    data
  }
}

function readFile(file: string) {
  if (file === ".git" || file === ".vscode" || file === "node_modules") return;
  const data =  fs.readFileSync(file).toString()
  return {
    message: `read file: ${file} successfull`,
    data
  }
}

function writeFile(file: string, data: any) {
  fs.writeFileSync(file, data)
  return {
    message: `write file: ${file} successfull`,
  }
}

export const TOOLS: Tools[] = [
  {
    id: "1",
    name: "read_current_dir",
    function: readCurrentDir,
    inputs_for_fn: null,
    description: "this is the tool used to read all the files and folder or the current working dir",
  },
  {
    id: "2",
    name: "read_file",
    function: (file) => readFile(file as string),
    inputs_for_fn: {
      input: "string"
    },
    description: "this is the tool used for reading the data of the particular file, which required a file_name as an input",
  },
  {
    id: "3",
    name: "write_file",
    function: (inputs_for_fn) => writeFile(inputs_for_fn.file as string, inputs_for_fn.data),
    inputs_for_fn: {
      file: "string",
      data: "string"
    },
    description: "this is the tool used for writing into the given file, it requires two inputs_for_fn which are file and data",
  },
]