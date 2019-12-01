import * as ts from "typescript";
import { extractComments, parseTSDoc } from "../parser";
import { strict as assert } from "assert";
import { inspect, kindFilter } from "../util";
import * as tsdoc from "@microsoft/tsdoc";

function createVirtualSource({
  src,
  fileName
}: {
  src: string;
  fileName: string;
}) {
  return ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2015);
}

describe("extractComments", () => {
  it("parse example", () => {
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
});

describe("parseTSDoc", () => {
  it("extract DocComment", () => {
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

    foundComments.forEach(c => {
      const docComment = parseTSDoc(c);

      inspect(docComment, n => {
        if (n.kind === tsdoc.DocNodeKind.Block) {
          const blockNode = n as tsdoc.DocBlock;
          if (blockNode.blockTag.tagNameWithUpperCase === "@EXAMPLE") {
            kindFilter(n, tsdoc.DocNodeKind.FencedCode, fencedCode => {
              const codeNode = fencedCode as tsdoc.DocFencedCode;
              console.log(codeNode.code);

              return true;
            });
          }
        }
        return true;
      });
    });
  });
});
