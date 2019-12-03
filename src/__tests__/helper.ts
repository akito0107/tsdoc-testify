import * as ts from "typescript";
import { format } from "prettier";

export function createVirtualSource({
  src,
  fileName
}: {
  src: string;
  fileName: string;
}) {
  return ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2015);
}

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
