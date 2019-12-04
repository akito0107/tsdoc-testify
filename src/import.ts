import * as ts from "typescript";

export function splitImport(
  source: ts.SourceFile
): { imports: ts.Node[]; body: ts.Node } {
  const imports = [] as Array<ts.Node>;
  const stmts = [] as Array<ts.Statement>;

  source.statements.forEach(stmt => {
    if (ts.isImportDeclaration(stmt)) {
      imports.push(stmt);
    } else {
      stmts.push(stmt);
    }
  });
  const body = ts.updateSourceFileNode(source, stmts);

  return { imports, body };
}

export function mergeImports(
  imports: ts.ImportDeclaration[]
): ts.Node {

}