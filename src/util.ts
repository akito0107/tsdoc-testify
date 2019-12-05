import * as tsdoc from "@microsoft/tsdoc";
import * as ts from "typescript";

export interface IVisitor {
  visit(node: tsdoc.DocNode): IVisitor;
}

export function walk(visitor: IVisitor, node: tsdoc.DocNode) {
  const next = visitor.visit(node);
  if (!next) {
    return;
  }

  for (const n of node.getChildNodes()) {
    walk(next, n);
  }
}

type inspectFn<N extends tsdoc.DocNode> = (n: N) => boolean;

class Inspector implements IVisitor {
  private readonly inspector: inspectFn<tsdoc.DocNode>;

  constructor(inspector: inspectFn<tsdoc.DocNode>) {
    this.inspector = inspector;
  }

  visit(node: tsdoc.DocNode) {
    if (this.inspector(node)) {
      return this;
    }
    return null;
  }
}

export function inspect(node: tsdoc.DocNode, callback: inspectFn<any>) {
  const inspector = new Inspector(callback);
  walk(inspector, node);
}

type FromKind<K extends tsdoc.DocNodeKind> = K extends tsdoc.DocNodeKind.Block
  ? tsdoc.DocBlock
  : K extends tsdoc.DocNodeKind.BlockTag
  ? tsdoc.DocBlockTag
  : K extends tsdoc.DocNodeKind.Excerpt
  ? tsdoc.DocExcerpt
  : K extends tsdoc.DocNodeKind.FencedCode
  ? tsdoc.DocFencedCode
  : K extends tsdoc.DocNodeKind.CodeSpan
  ? tsdoc.DocCodeSpan
  : K extends tsdoc.DocNodeKind.Comment
  ? tsdoc.DocComment
  : K extends tsdoc.DocNodeKind.DeclarationReference
  ? tsdoc.DocDeclarationReference
  : K extends tsdoc.DocNodeKind.ErrorText
  ? tsdoc.DocErrorText
  : K extends tsdoc.DocNodeKind.EscapedText
  ? tsdoc.DocEscapedText
  : K extends tsdoc.DocNodeKind.HtmlAttribute
  ? tsdoc.DocHtmlAttribute
  : K extends tsdoc.DocNodeKind.HtmlEndTag
  ? tsdoc.DocHtmlEndTag
  : K extends tsdoc.DocNodeKind.HtmlStartTag
  ? tsdoc.DocHtmlStartTag
  : K extends tsdoc.DocNodeKind.InheritDocTag
  ? tsdoc.DocInheritDocTag
  : K extends tsdoc.DocNodeKind.InlineTag
  ? tsdoc.DocInlineTag
  : K extends tsdoc.DocNodeKind.LinkTag
  ? tsdoc.DocLinkTag
  : K extends tsdoc.DocNodeKind.MemberIdentifier
  ? tsdoc.DocMemberIdentifier
  : K extends tsdoc.DocNodeKind.MemberReference
  ? tsdoc.DocMemberReference
  : K extends tsdoc.DocNodeKind.MemberSelector
  ? tsdoc.DocMemberSelector
  : K extends tsdoc.DocNodeKind.MemberSymbol
  ? tsdoc.DocMemberSymbol
  : K extends tsdoc.DocNodeKind.Paragraph
  ? tsdoc.DocParagraph
  : K extends tsdoc.DocNodeKind.ParamBlock
  ? tsdoc.DocParamBlock
  : K extends tsdoc.DocNodeKind.ParamCollection
  ? tsdoc.DocParamCollection
  : K extends tsdoc.DocNodeKind.PlainText
  ? tsdoc.DocPlainText
  : K extends tsdoc.DocNodeKind.Section
  ? tsdoc.DocSection
  : K extends tsdoc.DocNodeKind.SoftBreak
  ? tsdoc.DocSoftBreak
  : never;

export function kindFilter<T extends tsdoc.DocNodeKind>(
  node: tsdoc.DocNode,
  kind: T,
  callback: inspectFn<FromKind<T>>
) {
  const f = new Filter(kind, callback);
  walk(f, node);
}

class Filter<K extends tsdoc.DocNodeKind> implements IVisitor {
  private readonly filterKind: K;
  private readonly callback: inspectFn<FromKind<K>>;

  constructor(kind: K, inspector: inspectFn<FromKind<K>>) {
    this.filterKind = kind;
    this.callback = inspector;
  }

  visit(node: tsdoc.DocNode) {
    if (node.kind === this.filterKind) {
      if (!this.callback(node as FromKind<K>)) {
        return null;
      }
    }
    return this;
  }
}

/**
 * Check given kind is declaration
 *
 * @remarks
 * from: https://github.com/microsoft/tsdoc/blob/master/api-demo/src/advancedDemo.ts
 *
 * @param kind
 */
export function isDeclarationKind(kind: ts.SyntaxKind) {
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
