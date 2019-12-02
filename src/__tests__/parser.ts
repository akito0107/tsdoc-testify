import * as ts from "typescript";
import { collectExampleCodes, extractComments, parseTSDoc } from "../parser";
import { strict as assert } from "assert";
import * as tsdoc from "@microsoft/tsdoc";
import { createVirtualSource } from "./helper";

describe("extractComments", () => {
  it("single case", () => {
    const source = createVirtualSource({
      src: `
    /**
 * Test function
 *
 * @example
 *
 * \`\`\` 
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
    assert(ts.isFunctionDeclaration(foundComments[0].compilerNode));
  });

  it("multi declare", () => {
    const source = createVirtualSource({
      src: `/**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}

/**
 * Test function2
 *
 * @example
 *
 * \`\`\` 
 * test2()
 * \`\`\`
 */
export function test2() {
  console.log("hello");
}
    `,
      fileName: "virtual.ts"
    });

    const foundComments = extractComments(source);

    assert.equal(foundComments.length, 2);
    assert(ts.isFunctionDeclaration(foundComments[0].compilerNode));
  });
});

describe("parseTSDoc", () => {
  const source = createVirtualSource({
    src: `
    /**
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
  const paragraph = docNode.summarySection.getChildNodes()[0] as tsdoc.DocParamCollection;
  assert.equal(
    (paragraph.getChildNodes()[0] as tsdoc.DocPlainText).text,
    "Test function"
  );
});

describe("collectExampleCodes", () => {
  const source = createVirtualSource({
    src: `/**
 * Test function
 *
 * @example
 *
 * \`\`\` 
 * import { test1 } from "test-mod"
 * test()
 * test()
 * \`\`\`
 */
export function test() {
  // test
  console.log("hello");
}

/**
 * Test function2
 *
 * @example
 *
 * \`\`\` 
 * import { test2 } from "test-mod"
 * test2()
 * test2()
 * \`\`\`
 */
export function test2() {
  // test
  console.log("hello");
}

    `,
    fileName: "virtual.ts"
  });

  const foundComments = extractComments(source);
  const docNode = parseTSDoc(foundComments[1]);
  const examples = collectExampleCodes(
    foundComments[1].compilerNode,
    source,
    docNode
  );
  //TODO
  // assert.equal(examples[0].name, "virtual.ts_2");
  assert.equal(
    examples[0].code,
    `import { test2 } from "test-mod"
test2()
test2()
`
  );
});
