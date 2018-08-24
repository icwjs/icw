import { drain, forEach, of } from "../../src";
import { noop } from "../helpers/noop";
import { noopSync } from "../helpers/noopSync";

export function runTapSuite(tap) {
  test("returns same async iterator", () => {
    expect.assertions(1);
    expect(tap(of(), noop)).toReturnSameAsyncIterator();
  });

  test("returns a closeable iterator", async () => {
    expect.assertions(1);
    await expect(tap(of(), noop)).toBeCloseableAsyncIterator();
  });

  test("lazily consumes wrapped async iterable", async () => {
    expect.assertions(1);
    await expect(_ => tap(_, noop)).toLazilyConsumeWrappedAsyncIterable();
  });

  test("lazily consumes wrapped sync iterable", async () => {
    expect.assertions(1);
    await expect(_ => tap(_, noop)).toLazilyConsumeWrappedIterable();
  });

  test.each`
    callbackType | callback
    ${"async"}   | ${noop}
    ${"sync"}    | ${noopSync}
  `(
    "calls $callbackType callback once for each result of input",
    async ({ callback }) => {
      expect.assertions(1);

      let input = of(1, 2, 3);
      let mockCallback = jest.fn(callback);

      await forEach(input, mockCallback);
      expect(mockCallback).toHaveBeenCalledTimes(3);
    }
  );

  test("calls callback before yielding the result", async () => {
    expect.assertions(3);
    let callback = jest.fn();
    let tap$ = tap(["foo", "bar", "baz"], callback);

    await forEach(tap$, (_, index) => {
      // If the result were yielded _before_ calling the callback, then the
      // call count would be equal to the index, because the generator would
      // suspend before calling the function.
      expect(callback).toHaveBeenCalledTimes(index + 1);
    });
  });

  test("provides two arguments to callback", async () => {
    expect.assertions(1);

    await drain(
      tap(of(true), (...args) => {
        expect(args).toHaveLength(2);
      })
    );
  });

  test("provides current result as first argument to callback", async () => {
    expect.assertions(3);

    let input = of("foo", "bar", "baz");
    let expectedArgs = ["foo", "bar", "baz"];

    await drain(
      tap(input, result => {
        expect(result).toStrictEqual(expectedArgs.shift());
      })
    );
  });

  test("provides current index as second argument to callback", async () => {
    expect.assertions(3);

    let input = of("foo", "bar", "baz");
    let expectedIndexes = [0, 1, 2];

    await drain(
      tap(input, (_, index) => {
        expect(index).toStrictEqual(expectedIndexes.shift());
      })
    );
  });

  test("calls callback with an `undefined` `this`-context by default", async () => {
    expect.assertions(1);
    await drain(tap(of(1), callback));

    function callback() {
      expect(this).toBeUndefined();
    }
  });

  test("calls callback with the `this`-context provided by `thisArg` argument", async () => {
    expect.assertions(1);
    let expectedThis = {};
    await drain(tap(of(1), callback, expectedThis));

    function callback() {
      expect(this).toBe(expectedThis);
    }
  });
}
