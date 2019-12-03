import { createVirtualSource, print } from "./helper";
import * as ts from "typescript";
import { strict as assert } from "assert";
import { splitImport } from "../import";

test("split imports", () => {
  const source = createVirtualSource({
    src: `
import { a, b } from "moduleA";
a();
b();
`,
    fileName: "virtual.ts"
  });

  const { imports, body } = splitImport(source);

  assert.equal(
    print(body),
    `a();
b();
`
  );

  const importSource = createVirtualSource({ src: "", fileName: "forassert" });
  const importAST = ts.updateSourceFileNode(
    importSource,
    imports as Array<ts.Statement>
  );

  assert.equal(print(importAST), `import { a, b } from "moduleA";`);
});
