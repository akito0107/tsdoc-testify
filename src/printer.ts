import * as ts from "typescript";
import { ExampleCodeSpec } from "./parser";

export type PrinterOption = {}

export class Printer {
  private readonly source: ts.SourceFile;
  private examples: ExampleCodeSpec[] = [];

  constructor(source: ts.SourceFile, opts: PrinterOption = {}) {
    this.source = source;
  }

  append(example: ExampleCodeSpec) {
    this.examples.push(example);
  }

  print() {
  }
}
