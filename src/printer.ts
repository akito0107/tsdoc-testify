import { format } from "prettier";
import * as ts from "typescript";

export function print(ast: ts.Node): string {
  const resultFile = ts.createSourceFile(
    "result.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });
  const result = printer.printNode(ts.EmitHint.Unspecified, ast, resultFile);

  return format(result, { parser: "typescript" });
}
