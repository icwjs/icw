import { of } from "./of";
import { from, FromInput } from "./from";
import { DelegatingAsyncIterable } from "./__internal__/DelegatingAsyncIterable";

export class ICW<T> extends DelegatingAsyncIterable<T> {
  static from<U>(input: FromInput<U>): ICW<U> {
    return new ICW(from(input));
  }

  static of<U>(...items: U[]): ICW<U> {
    return new ICW(of(...items));
  }
}
