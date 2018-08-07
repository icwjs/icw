const createConsumableIterable = (
  maxIterations: number,
  tick: jest.Mock<any>
): Iterable<void> => ({
  [Symbol.iterator]() {
    let iteration = 0;
    return {
      next() {
        iteration += 1;
        let result = { value: undefined, done: iteration >= maxIterations };

        tick();
        return result;
      }
    };
  }
});

const createConsumableAsyncIterable = (
  maxIterations: number,
  tick: jest.Mock<any>
): AsyncIterable<void> => ({
  [Symbol.asyncIterator]() {
    let iteration = 0;
    return {
      async next() {
        iteration += 1;
        let result = { value: undefined, done: iteration >= maxIterations };

        tick();
        return result;
      }
    };
  }
});

export const runConsumeSuite = (consume: Function) => {
  test("returns a Promise", async () => {
    expect.assertions(1);
    expect(consume([])).toBeInstanceOf(Promise);
  });

  test("runs the provided iterable to completion", async () => {
    expect.assertions(2);
    let tick = jest.fn();

    let iterations = 3;
    let result = await consume(createConsumableIterable(iterations, tick));

    expect(result).toBeUndefined();
    expect(tick).toHaveBeenCalledTimes(iterations);
  });

  test("runs the provided async iterable to completion", async () => {
    expect.assertions(2);
    let tick = jest.fn();

    let iterations = 3;
    let result = await consume(createConsumableAsyncIterable(iterations, tick));

    expect(result).toBeUndefined();
    expect(tick).toHaveBeenCalledTimes(iterations);
  });
};