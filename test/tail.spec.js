import { tail } from "../src/tail";

import { of } from "../src/of";
import { ArrayLike } from "./helpers/ArrayLike";

test("rejects on non-IterableLike input", async () => {
  expect.assertions(2);
  try {
    await tail(null).next();
  } catch (error) {
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toMatchInlineSnapshot(
      `"Must provide an iterable, async iterable, Array-like value, or a Promise."`
    );
  }
});

test("returns same async iterator", () => {
  expect.assertions(1);
  expect(tail(of())).toReturnSameAsyncIterator();
});

test("returns a closeable iterator", async () => {
  expect.assertions(1);
  await expect(tail(of())).toBeCloseableAsyncIterator();
});

test("lazily consumes provided IterableLike input", async () => {
  expect.assertions(1);
  await expect(_ => tail(_)).toLazilyConsumeWrappedAsyncIterable();
});

test.each`
  inputType          | iterableLike                          | expectedValues
  ${"AsyncIterable"} | ${of("foo", "bar", "baz")}            | ${["bar", "baz"]}
  ${"Iterable"}      | ${["foo", "bar", "baz"]}              | ${["bar", "baz"]}
  ${"ArrayLike"}     | ${new ArrayLike("foo", "bar", "baz")} | ${["bar", "baz"]}
`(
  "yields all but the first value from $inputType input",
  async ({ iterableLike, expectedValues }) => {
    expect.assertions(expectedValues.length);

    for await (let value of tail(iterableLike)) {
      expect(value).toStrictEqual(expectedValues.shift());
    }
  }
);

test("yields no values for Promise input", async () => {
  expect.assertions(1);
  let iterator = tail(Promise.resolve("foo"));
  let result = await iterator.next();
  expect(result.done).toBe(true);
});
