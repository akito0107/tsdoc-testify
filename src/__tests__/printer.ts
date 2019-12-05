import * as ts from "typescript";
import {
  collectExampleCodes,
  ExampleCodeSpec,
  extractComments,
  parseTSDoc
} from "../parser";
import { createVirtualSource } from "./helper";
import { strict as assert } from "assert";
function exampleToJestAST(example: ExampleCodeSpec): ts.Node {
  const functionName = ts.createIdentifier("test");

  const caseName = ts.createIdentifier(example.name);
  const blockExpr = ts.createBlock([
    ts.createExpressionStatement(ts.createIdentifier(example.code))
  ]);

  const testBody = ts.createArrowFunction(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    blockExpr
  );

  const testCaseAST = ts.createCall(functionName, undefined, [
    caseName,
    testBody
  ]);
  return ts.createExpressionStatement(testCaseAST);
}

test("print ast", () => {
  const source = createVirtualSource({
    src: `/**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * test()
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}
`,
    fileName: "virtual.ts"
  });

  const foundComments = extractComments(source);
  const docNode = parseTSDoc(foundComments[0]);
  const examples = collectExampleCodes(
    foundComments[0].compilerNode,
    source,
    docNode
  );
  const ast = exampleToJestAST(examples[0]);

  const resultSource = ts.createSourceFile(
    "test.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });

  const result = printer.printNode(ts.EmitHint.Unspecified, ast, resultSource);

  assert.equal(result, ``);
});
