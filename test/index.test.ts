import {pipe} from "fp-ts/lib/function"
import {ap} from "fp-ts/lib/Identity"
import {Context, flatMap, fold, map, parse, regex, string} from "../src"

describe("parse", () => {
  it("should return a basic success context", () => {
    const ctx = parse("foo")
    expect(ctx).toEqual<Context<string>>({
      _tag: "Success",
      input: "foo",
      result: ""
    })
  })
})

describe("string", () => {
  describe("when the input doesnt start with the specified string", () => {
    it("should return an error context", () => {
      const ctx = pipe(string("foo"), ap(parse("bar")))
      expect(ctx).toEqual<Context<string>>({
        _tag: "Error",
        expected: ["foo"],
        input: "bar"
      })
    })
  })

  describe("when the input starts with the specified string", () => {
    it("should return a success context", () => {
      const ctx = pipe(string("foo"), ap(parse("foo")))
      expect(ctx).toEqual<Context<string>>({
        _tag: "Success",
        input: "",
        result: "foo"
      })
    })
  })
})

describe("regex", () => {
  describe("when the input doesnt start with the specified pattern", () => {
    it("should return an error context", () => {
      const ctx = pipe(regex(/foo/), ap(parse("bar")))
      expect(ctx).toEqual<Context<string>>({
        _tag: "Error",
        expected: ["/foo/"],
        input: "bar"
      })
    })
  })

  describe("when the input starts with the specified pattern", () => {
    it("should return a success context", () => {
      const ctx = pipe(regex(/foo/), ap(parse("foo")))
      expect(ctx).toEqual<Context<string>>({
        _tag: "Success",
        input: "",
        result: "foo"
      })
    })
  })
})

describe("map", () => {
  describe("when an error context is specified", () => {
    it("should return the same context", () => {
      const ctx = pipe(
        parse("foo"),
        string("bar"),
        map(result => result.toUpperCase())
      )
      expect(ctx).toEqual<Context<string>>({
        _tag: "Error",
        expected: ["bar"],
        input: "foo"
      })
    })
  })

  describe("when a success context is specified", () => {
    it("should return a new combinator with the mapped result", () => {
      const ctx = pipe(
        parse("foo"),
        string("foo"),
        map(result => result.toUpperCase())
      )
      expect(ctx).toEqual<Context<string>>({
        _tag: "Success",
        input: "",
        result: "FOO"
      })
    })
  })
})

describe("flatMap", () => {
  describe("when an error context is specified", () => {
    it("should return the same context", () => {
      const ctx = pipe(
        parse("foo"),
        string("bar"),
        flatMap(result => string(result))
      )
      expect(ctx).toEqual<Context<string>>({
        _tag: "Error",
        expected: ["bar"],
        input: "foo"
      })
    })
  })

  describe("when a success context is specified", () => {
    describe("but the next parser fails", () => {
      it("should return an error context", () => {
        const ctx = pipe(
          parse("foo"),
          string("foo"),
          flatMap(result => string(result))
        )
        expect(ctx).toEqual<Context<string>>({
          _tag: "Error",
          expected: ["foo"],
          input: ""
        })
      })
    })

    describe("and the next parser succeeds", () => {
      it("should return a success context", () => {
        const ctx = pipe(
          parse("foofoo"),
          string("foo"),
          flatMap(result => string(result))
        )
        expect(ctx).toEqual<Context<string>>({
          _tag: "Success",
          input: "",
          result: "foo"
        })
      })
    })
  })
})

describe("fold", () => {
  describe("when an error context is specified", () => {
    it("should return the result of the error branch", () => {
      const result = pipe(
        parse("foo"),
        string("bar"),
        fold({
          Error: ctx => `Expected ${ctx.expected.join(", ")}`,
          Success: ctx => `Found ${ctx.result}`
        })
      )
      expect(result).toEqual<string>(`Expected bar`)
    })
  })

  describe("when a success context is specified", () => {
    it("should return the result of the success branch", () => {
      const result = pipe(
        parse("foo"),
        string("foo"),
        fold({
          Error: ctx => `Expected ${ctx.expected.join(", ")}`,
          Success: ctx => `Found ${ctx.result}`
        })
      )
      expect(result).toEqual<string>("Found foo")
    })
  })
})
