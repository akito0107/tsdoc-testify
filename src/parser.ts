import * as tsdoc from "@microsoft/tsdoc";
import * as ts from "typescript";

import { isDeclarationKind, kindFilter } from "./util";

export interface IFoundComment {
  compilerNode: ts.Node;
  textRange: tsdoc.TextRange;
}

/**
 *
 * Collect comments from ts.SourceFile
 *
 * @param source
 */
export function extractComments(source: ts.SourceFile) {
  const foundComments: IFoundComment[] = [];

  function walk(node: ts.Node) {
    if (!isDeclarationKind(node.kind)) {
      node.forEachChild(walk);
      return false;
    }

    const buffer = source.getFullText();
    const ranges = getJSDocCommentRanges(node, buffer);

    ranges.forEach(comment => {
      foundComments.push({
        compilerNode: node,
        textRange: tsdoc.TextRange.fromStringRange(
          buffer,
          comment.pos,
          comment.end
        )
      });
    });
    node.forEachChild(walk);
    return false;
  }

  walk(source);

  const cs = foundComments.reduce((acc, comment) => {
    if (!acc[comment.textRange.toString()]) {
      acc[comment.textRange.toString()] = [];
    }
    acc[comment.textRange.toString()].push(comment);
    return acc;
  }, {});

  return Object.values(cs)
    .map((nodes: Array<IFoundComment>) => {
      return nodes[0];
    })
    .sort((a, b) => {
      return a.textRange.pos - b.textRange.pos;
    });
}

/**
 * Retrieves the JSDoc-style comments associated with a specific AST node.
 *
 * @remarks
 * Based on ts.getJSDocCommentRanges() from the compiler.
 * https://github.com/Microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
 *
 * from https://github.com/microsoft/tsdoc/blob/master/api-demo/src/advancedDemo.ts
 */
function getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
  const commentRanges: ts.CommentRange[] = [];

  switch (node.kind) {
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.TypeParameter:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.ParenthesizedExpression:
    case ts.SyntaxKind.VariableStatement: // needed on our case
      commentRanges.push(
        ...(ts.getTrailingCommentRanges(text, node.pos) || [])
      );
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || [])); // // style comments

  // True if the comment starts with '/**' but not if it is '/**/'
  return commentRanges.filter(
    comment =>
      text.charCodeAt(comment.pos + 1) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 2) ===
        0x2a /* ts.CharacterCodes.asterisk */ &&
      text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */
  );
}

export function parseTSDoc(comment: IFoundComment): tsdoc.DocComment {
  const tsdocParser: tsdoc.TSDocParser = new tsdoc.TSDocParser(
    new tsdoc.TSDocConfiguration()
  );

  const parserContext = tsdocParser.parseRange(comment.textRange);
  return parserContext.docComment;
}

export type ExampleCodeSpec = {
  name: string;
  code: string;
  node: ts.Node;
  source: ts.SourceFile;
};

export function collectExampleCodes(
  parent: ts.Node,
  source: ts.SourceFile,
  docNode: tsdoc.DocComment
): Array<ExampleCodeSpec> {
  const specs: ExampleCodeSpec[] = [];

  let order = 0;
  kindFilter(docNode, tsdoc.DocNodeKind.Block, (node: tsdoc.DocNode) => {
    kindFilter(node, tsdoc.DocNodeKind.FencedCode, fenced => {
      specs.push({
        source,
        node: parent,
        code: (fenced as tsdoc.DocFencedCode).code,
        name: buildName(source, parent, ++order)
      });
      return true;
    });
    return true;
  });

  return specs;
}

function buildName(source: ts.SourceFile, _: ts.Node, order: number): string {
  return `${source.fileName}_${order}`;
}
