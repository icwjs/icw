import { last } from "../src/last";

import { of } from "../src/of";
import { ArrayLike } from "./helpers/ArrayLike";

test("rejects on non-IterableLike input", async () => {
  expect.assertions(2);
  try {
    await last(null);
  } catch (error) {
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toMatchInlineSnapshot(
      `"Must provide an iterable, async iterable, Array-like value, or a Promise."`
    );
  }
});

test("eagerly consumes wrapped IterableLike input", async () => {
  expect.assertions(1);
  await expect(_ => last(_)).toEagerlyConsumeWrappedAsyncIterable();
});

test.each`
  inputType          | iterableLike                          | expectedValue
  ${"AsyncIterable"} | ${of("foo", "bar", "baz")}            | ${"baz"}
  ${"Iterable"}      | ${["foo", "bar", "baz"]}              | ${"baz"}
  ${"ArrayLike"}     | ${new ArrayLike("foo", "bar", "baz")} | ${"baz"}
  ${"Promise"}       | ${Promise.resolve("foo")}             | ${"foo"}
`(
  "resolves to the  value of $inputType input",
  async ({ iterableLike, expectedValue }) => {
    expect.assertions(1);
    await expect(last(iterableLike)).resolves.toStrictEqual(expectedValue);
  }
);

test.each`
  inputType          | iterableLike
  ${"AsyncIterable"} | ${of()}
  ${"Iterable"}      | ${[]}
  ${"ArrayLike"}     | ${new ArrayLike()}
  ${"Promise"}       | ${Promise.resolve()}
`(
  "resolves to `undefined` if $inputType input contains no values",
  async ({ iterableLike }) => {
    expect.assertions(1);
    await expect(last(iterableLike)).resolves.toBeUndefined();
  }
);
