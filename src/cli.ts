#!/usr/bin/env node

import { makeCommand, makeStringFlag, mergeFlag } from "catacli";
import * as path from "path";
import * as glob from "glob";
import { generate } from "./app";

const flag = mergeFlag(
  makeStringFlag("filepath", {
    usage: "src file path (only single file accepted)"
  }),
  makeStringFlag("fileMatch", {
    usage: "src file path (regexp)."
  })
);

const command = makeCommand({
  name: "tsdoctestify",
  description: "documentation testing generator for tsdoc",
  version: "0.0.1",
  usage: "testdoctestify [OPTIONS]",
  flag,
  handler: (_, params) => {
    if (!params.filepath.value && !params.fileMatch.value) {
      console.log("`--filepath` or `--fileMatch` is required.");
    }

    if (params.fileMatch.value) {
      glob(params.fileMatch.value, (err, files) => {
        if (err) {
          console.error(err);
        }
        files.forEach(f => {
          const filePath = path.resolve(process.cwd(), f);
          generate({ filePath });
        });
      });
    }

    if (params.filepath.value) {
      const filePath = path.resolve(process.cwd(), params.filepath.value);
      generate({ filePath });
    }
  }
});

command(process.argv.splice(2));
