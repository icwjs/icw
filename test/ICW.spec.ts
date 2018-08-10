import { ICW } from "../src";
import { isEven } from "./helpers/isEven";
import { noop } from "./helpers/noop";
import { sum } from "./helpers/sum";

import { runFromSuite } from "./suites/runFromSuite";
import { runOfSuite } from "./suites/runOfSuite";
import { runDrainSuite } from "./suites/runDrainSuite";
import { runFilterSuite } from "./suites/runFilterSuite";
import { runMapSuite } from "./suites/runMapSuite";
import { runRejectSuite } from "./suites/runRejectSuite";
import { runScanSuite } from "./suites/runScanSuite";
import { runWithIndexSuite } from "./suites/runWithIndexSuite";

test("is a class", () => {
  expect.assertions(2);
  expect(ICW).toBeFunction();
  expect(String(ICW)).toMatch(/^class/);
});

test("is an async iterable", async () => {
  expect.assertions(1);
  await expect(new ICW([])).toBeAsyncIterable();
});

describe.each`
  method    | args        | runSuite
  ${"of"}   | ${[]}       | ${runOfSuite}
  ${"from"} | ${[isEven]} | ${runFromSuite}
`("static method $method", ({ method, args, runSuite }) => {
  test("is a function", () => {
    expect.assertions(1);
    expect((ICW as any)[method]).toBeFunction();
  });

  test("returns an ICW instance", () => {
    expect.assertions(1);
    expect((ICW as any)[method](...args)).toBeInstanceOf(ICW);
  });

  runSuite((ICW as any)[method]);
});

describe.each`
  method         | args        | returnInstance | runSuite
  ${"drain"}     | ${[]}       | ${Promise}     | ${runDrainSuite}
  ${"filter"}    | ${[isEven]} | ${ICW}         | ${runFilterSuite}
  ${"map"}       | ${[noop]}   | ${ICW}         | ${runMapSuite}
  ${"reject"}    | ${[isEven]} | ${ICW}         | ${runRejectSuite}
  ${"scan"}      | ${[sum]}    | ${ICW}         | ${runScanSuite}
  ${"withIndex"} | ${[]}       | ${ICW}         | ${runWithIndexSuite}
`("prototype method $method", ({ method, args, returnInstance, runSuite }) => {
  // eslint-disable-next-line jest/no-identical-title
  test("is a function", () => {
    expect.assertions(1);
    expect((ICW.prototype as any)[method]).toBeFunction();
  });

  test(`returns a ${returnInstance.name}`, () => {
    expect.assertions(1);
    let icw: any = new ICW([1, 2, 3]);
    expect(icw[method](...args)).toBeInstanceOf(returnInstance);
  });

  runSuite(bindMethod(method));
});

function bindMethod<T>(method: keyof ICW<T>) {
  return function callBoundMethod(
    iterable: AsyncIterable<T> | Iterable<T>,
    ...args: any[]
  ): any {
    // @ts-ignore
    return new ICW(iterable)[method](...args);
  };
}
