import { createVirtualSource, print } from "./helper";
import * as ts from "typescript";
import { strict as assert } from "assert";
import { mergeImports, splitImport } from "../import";

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

  assert.equal(
    print(importAST),
    `import { a, b } from "moduleA";
`
  );
});

function mergeImportsRunner(src: string, expect: string) {
  const source = createVirtualSource({
    src,
    fileName: "virtual.ts"
  });
  const { imports } = splitImport(source);
  const results = mergeImports(imports);
  const importSource = createVirtualSource({ src: "", fileName: "forassert" });
  const importAST = ts.updateSourceFileNode(
    importSource,
    results as Array<ts.Statement>
  );
  assert.equal(print(importAST), expect);
}

test("merge imports", () => {
  mergeImportsRunner(
    `import { a, b } from "moduleA";
import { b, c } from "moduleA";`,
    `import { a, b, c } from "moduleA";
`
  );
});

test("merge imports (multi module)", () => {
  mergeImportsRunner(
    `import { a, b } from "moduleA";
import { b, c } from "moduleA";,
import { d, e } from "moduleB";
`,
    `import { a, b, c } from "moduleA";
import { d, e } from "moduleB";
`
  );
});

test("as alias imports", () => {
  mergeImportsRunner(
    `import { a as alias, b as balias } from "moduleA";
import { b as balias, c } from "moduleA";,
`,
    `import { a as alias, b as balias, c } from "moduleA";
`
  );
});

test("named imports + identifier", () => {
  mergeImportsRunner(
    `import React, { useCallback } from "react";
import React, { useState, useCallback } from "react";,
`,
    `import React, { useCallback, useState } from "react";
`
  );
});
