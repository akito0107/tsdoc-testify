import * as ts from "typescript";

export function splitImport(
  source: ts.SourceFile
): { imports: ts.ImportDeclaration[]; body: ts.Node } {
  const imports = [] as Array<ts.ImportDeclaration>;
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

function unique<T>(arr: Array<T>): Array<T> {
  return Array.from(new Set(arr));
}

export function mergeImports(imports: ts.ImportDeclaration[]): ts.Node[] {
  const reduced = imports.reduce((acc, i) => {
    const moduleSpecifier = (i?.moduleSpecifier as ts.StringLiteral)?.text;
    if (!moduleSpecifier) {
      return acc;
    }
    if (!acc[moduleSpecifier]) {
      acc[moduleSpecifier] = [];
    }
    acc[moduleSpecifier].push(i);
    return acc;
  }, {});

  return Object.values(reduced).map((r: Array<ts.ImportDeclaration>) => {
    const names = r.reduce(
      (acc, i) => {
        const idents = i.importClause?.name
          ? unique([...acc.idents, i.importClause.name.escapedText])
          : acc.idents;

        const namedImports = i.importClause?.namedBindings as ts.NamedImports;
        if (!namedImports) {
          return { ...acc, idents };
        }

        const specifiers = namedImports.elements
          ?.filter(e => e)
          .map(s => {
            if (s.propertyName) {
              return `${s.propertyName.escapedText} as ${s.name.escapedText}`;
            }
            return s.name.escapedText;
          });

        return {
          bindings: unique([...acc.bindings, ...specifiers]),
          idents
        };
      },
      { bindings: [], idents: [] }
    );

    const namedImportSpecifiers = names.bindings.map(n => {
      // TOOD: passing propertyName with correct way
      return ts.createImportSpecifier(undefined, ts.createIdentifier(n));
    });
    const name =
      names.idents.length !== 0
        ? ts.createIdentifier(names.idents[0])
        : undefined;

    return ts.createImportDeclaration(
      undefined,
      undefined,
      ts.createImportClause(name, ts.createNamedImports(namedImportSpecifiers)),
      r[0].moduleSpecifier
    );
  });
}
