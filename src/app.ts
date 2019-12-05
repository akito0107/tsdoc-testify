import * as ts from "typescript";
import { collectExampleCodes, extractComments, parseTSDoc } from "./parser";
import { mergeImports, splitImport } from "./import";
import { wrapTestFunction } from "./funcwrapper";
import { print } from "./printer";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";

export function generate({ filePath }) {
  const { ext, name, dir } = path.parse(filePath);

  let kind;
  switch (ext.toUpperCase()) {
    case ".TS":
      kind = ts.ScriptKind.TS;
      break;
    case ".TSX":
      kind = ts.ScriptKind.TSX;
      console.log("currently unsupported tsx ", filePath);
      return;
    default:
      console.log("unknown file extension ", filePath);
      return;
  }

  const source = ts.createSourceFile(
    filePath,
    readFileSync(filePath).toString(),
    ts.ScriptTarget.Latest,
    false,
    kind
  );

  const foundComments = extractComments(source);

  if (foundComments.length === 0) {
    console.log(`${filePath} comments not found`);
    return;
  }

  const { imports, testBody } = foundComments
    .map(f => {
      return { docNode: parseTSDoc(f), node: f.compilerNode };
    })
    .map(({ docNode, node }) => {
      return collectExampleCodes(node, source, docNode);
    })
    .flat()
    .map(example => {
      return {
        ...example,
        exampleSource: ts.createSourceFile(
          example.name,
          example.code,
          ts.ScriptTarget.Latest,
          false,
          kind
        )
      };
    })
    .reduce(
      (acc, { source, exampleSource, name }) => {
        const { imports, body } = splitImport(exampleSource);

        const funcName =
          name !== "" ? name : `${source.fileName}_${acc.counter++}`;

        const testBody = wrapTestFunction(funcName, body);
        return {
          ...acc,
          imports: [...acc.imports, ...imports],
          testBody: [...acc.testBody, testBody]
        };
      },
      { imports: [], testBody: [], counter: 0 }
    );

  const mergedImports = mergeImports(imports);

  const ast = ts.updateSourceFileNode(
    ts.createSourceFile(
      filePath + ".doctest",
      "",
      ts.ScriptTarget.Latest,
      false,
      kind
    ),
    [...mergedImports, ...testBody]
  );

  writeFileSync(`${dir}/${name}.doctest.ts`, print(ast));
}
