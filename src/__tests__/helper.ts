import * as ts from "typescript";

export function createVirtualSource({
  src,
  fileName
}: {
  src: string;
  fileName: string;
}) {
  return ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2015);
}
