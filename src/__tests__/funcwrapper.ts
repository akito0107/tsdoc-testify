import { createVirtualSource } from "./helper";
import { strict as assert } from "assert";
import { splitImport } from "../import";
import { wrapTestFunction } from "../funcwrapper";
import { print } from "../printer";

test("print ast", () => {
  const source = createVirtualSource({
    src: `import { a, b } from "moduleA";
a();
b();
`,
    fileName: "virtual.ts",
  });

  const { body } = splitImport(source);

  const ast = wrapTestFunction("aaa", body);

  assert.equal(
    print(ast),
    `test("aaa", () => {
  a();
  b();
});
`
  );
});
