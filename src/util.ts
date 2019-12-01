import * as tsdoc from "@microsoft/tsdoc";

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

type inspectFn = (n: tsdoc.DocNode) => boolean;

class Inspector implements IVisitor {
  private inspector: inspectFn;

  constructor(inspector: inspectFn) {
    this.inspector = inspector;
  }

  visit(node: tsdoc.DocNode) {
    if (this.inspector(node)) {
      return this;
    }
    return null;
  }
}

export function inspect(node: tsdoc.DocNode, callback: inspectFn) {
  const inspector = new Inspector(callback);
  walk(inspector, node);
}

export function kindFilter(
  node: tsdoc.DocNode,
  kind: tsdoc.DocNodeKind,
  callback: inspectFn
) {
  const f = new Filter(kind, callback);
  walk(f, node);
}

class Filter implements IVisitor {
  private filterKind: tsdoc.DocNodeKind;
  private callback: inspectFn;

  constructor(kind: tsdoc.DocNodeKind, inspector: inspectFn) {
    this.filterKind = kind;
    this.callback = inspector;
  }

  visit(node: tsdoc.DocNode) {
    if (node.kind === this.filterKind) {
      if (!this.callback(node)) {
        return null;
      }
    }
    return this;
  }
}
