export type ErrorContext = {
  readonly _tag: "Error"
  readonly expected: string[]
  readonly input: string
}

export type SuccessContext<A> = {
  readonly _tag: "Success"
  readonly input: string
  readonly result: A
}

export type Context<A> = ErrorContext | SuccessContext<A>

export type Combinator<A, B> = (ctx: Context<A>) => Context<B>

export function parse(input: string): Context<string> {
  return {
    _tag: "Success",
    input,
    result: ""
  }
}

export function string<A>(string: string): Combinator<A, string> {
  return ctx => {
    if (!ctx.input.startsWith(string)) {
      return {
        _tag: "Error",
        expected: [string],
        input: ctx.input
      }
    }
    return {
      _tag: "Success",
      input: ctx.input.slice(string.length),
      result: string
    }
  }
}

export function regex<A>(pattern: RegExp): Combinator<A, string> {
  return ctx => {
    const matches = ctx.input.match(pattern)
    if (!matches || matches.index !== 0) {
      return {
        _tag: "Error",
        expected: [pattern.toString()],
        input: ctx.input
      }
    }
    return {
      _tag: "Success",
      input: ctx.input.slice(matches[0].length),
      result: matches[0]
    }
  }
}

export function map<A, B>(fn: (a: A) => B): Combinator<A, B> {
  return ctx => {
    return ctx._tag === "Error" ? ctx : {...ctx, result: fn(ctx.result)}
  }
}

export function flatMap<A, B>(fn: (a: A) => Combinator<A, B>): Combinator<A, B> {
  return ctx => {
    return ctx._tag === "Error" ? ctx : fn(ctx.result)(ctx)
  }
}

export type FoldMap<A, B, C> = {
  readonly Error: (ctx: ErrorContext) => B
  readonly Success: (ctx: SuccessContext<A>) => C
}

export function fold<A, B, C>(foldMap: FoldMap<A, B, C>): (ctx: Context<A>) => B | C {
  return ctx => {
    return ctx._tag === "Error" ? foldMap.Error(ctx) : foldMap.Success(ctx)
  }
}
