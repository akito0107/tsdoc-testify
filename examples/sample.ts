/**
 * sum function
 *
 * @remarks
 * demo
 *
 * @example
 *
 * ```
 * import * as assert from "assert";
 * import { sum } from "./sample";
 *
 * assert.equal(sum(2, 1), 3);
 * ```
 *
 * @example
 * {@exampleCaseName customTag}
 * ```
 * import * as assert from "assert";
 * import { sum } from "./sample";
 *
 * assert.equal(sum(4, 5), 9);
 * ```
 *
 * @param a
 * @param b
 */
export function sum(a: number, b: number) {
  return a + b;
}

/**
 * sub function
 *
 * @remarks
 * demo
 *
 * @example
 * {@exampleCaseName custom name here}
 *
 * ```
 * import * as assert from "assert";
 * import { sub } from "./sample";
 *
 * assert.equal(sub(2, 1), 1);
 * ```
 *
 * @example
 *
 * ```
 * import * as assert from "assert";
 * import { sub } from "./sample";
 *
 * assert.equal(sub(4, 5), -1);
 * ```
 * @param a
 * @param b
 */
export function sub(a: number, b: number) {
  return a - b;
}

/**
 * duck class
 */
export class Duck {
  /**
   * @example
   * {@exampleCaseName class method example}
   *
   * ```
   * import * as assert from "assert";
   * import { Duck } from "./sample";
   *
   * const duck = new Duck();
   * assert.equal(duck.quack(), "quack");
   * ```
   *
   */
  quack() {
    return "quack"
  }
  /**
   * @example
   * {@ignoreExample}
   * ```
   * // below code not appear on tests.
   * duck.ignore()
   * ```
   *
   */
  ignore() {
    return "quack"
  }
}

/**
 * @example
 *
 * ```
 * import * as assert from "assert";
 * import { sub } from "./sample";
 *
 * assert.equal(sub(3, 2), 1);
 * ```
 *
 * @example
 * {@ignoreExample}
 *
 * ```
 * import * as assert from "assert";
 * import { sub } from "./sample";
 *
 * assert.equal(sub(2, 1), 1);
 * ```
 *
 */
export function sub(a: number, b: number) {
  return a - b;
}