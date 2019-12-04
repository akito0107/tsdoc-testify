import { makeCommand, makeStringFlag } from "catacli";
import * as path from "path";
import { generate } from "./app";

const flag = makeStringFlag("filepath");

const command = makeCommand({
  name: "tsdoc-testify",
  description: "catacli is typescript-friendly commander tool",
  version: "0.0.1",
  usage: "testdoc-testify [OPTIONS]",
  flag,
  handler: (_, params) => {
    const filePath = path.resolve(process.cwd(), params.filepath.value);
    generate({ filePath });
  }
});

command(process.argv.splice(2));
