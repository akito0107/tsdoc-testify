import * as tsdoc from "@microsoft/tsdoc";
import * as ts from "typescript";

import { kindFilter } from "./util";

/**
 * Check given kind is declaration
 *
 * @remarks
 * from: https://github.com/microsoft/tsdoc/blob/master/api-demo/src/advancedDemo.ts
 *
 * @param kind
 */
function isDeclarationKind(kind: ts.SyntaxKind) {
  return (
    kind === ts.SyntaxKind.ArrowFunction ||
    kind === ts.SyntaxKind.BindingElement ||
    kind === ts.SyntaxKind.ClassDeclaration ||
    kind === ts.SyntaxKind.ClassExpression ||
    kind === ts.SyntaxKind.Constructor ||
    kind === ts.SyntaxKind.EnumDeclaration ||
    kind === ts.SyntaxKind.EnumMember ||
    kind === ts.SyntaxKind.ExportSpecifier ||
    kind === ts.SyntaxKind.FunctionDeclaration ||
    kind === ts.SyntaxKind.FunctionExpression ||
    kind === ts.SyntaxKind.GetAccessor ||
    kind === ts.SyntaxKind.ImportClause ||
    kind === ts.SyntaxKind.ImportEqualsDeclaration ||
    kind === ts.SyntaxKind.ImportSpecifier ||
    kind === ts.SyntaxKind.InterfaceDeclaration ||
    kind === ts.SyntaxKind.JsxAttribute ||
    kind === ts.SyntaxKind.MethodDeclaration ||
    kind === ts.SyntaxKind.MethodSignature ||
    kind === ts.SyntaxKind.ModuleDeclaration ||
    kind === ts.SyntaxKind.NamespaceExportDeclaration ||
    kind === ts.SyntaxKind.NamespaceImport ||
    kind === ts.SyntaxKind.Parameter ||
    kind === ts.SyntaxKind.PropertyAssignment ||
    kind === ts.SyntaxKind.PropertyDeclaration ||
    kind === ts.SyntaxKind.PropertySignature ||
    kind === ts.SyntaxKind.SetAccessor ||
    kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
    kind === ts.SyntaxKind.TypeAliasDeclaration ||
    kind === ts.SyntaxKind.TypeParameter ||
    kind === ts.SyntaxKind.VariableDeclaration ||
    kind === ts.SyntaxKind.JSDocTypedefTag ||
    kind === ts.SyntaxKind.JSDocCallbackTag ||
    kind === ts.SyntaxKind.JSDocPropertyTag
  );
}

/**
 *
 * Collect comments from ts.sourceFile
 *
 * @param source
 */
export function extractComments(source: ts.SourceFile) {
  const foundComments: IFoundComment[] = [];
  source.forEachChild(node => {
    if (!isDeclarationKind(node.kind)) {
      return;
    }

    const buffer =
      node.getSourceFile()?.getFullText() || node.getFullText(source);

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
  });

  return foundComments;
}

export interface IFoundComment {
  compilerNode: ts.Node;
  textRange: tsdoc.TextRange;
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
      commentRanges.push(
        ...(ts.getTrailingCommentRanges(text, node.pos) || [])
      );
      break;
  }
  commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []));

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

type exampleCodeSpec = {
  name: string;
  code: string;
  node: ts.Node;
  source: ts.SourceFile;
};

export function collectExampleCodes(
  parent: ts.Node,
  source: ts.SourceFile,
  docNode: tsdoc.DocComment
): Array<exampleCodeSpec> {
  const specs: exampleCodeSpec[] = [];

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
