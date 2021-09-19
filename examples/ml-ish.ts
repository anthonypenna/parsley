import {flow, pipe} from "fp-ts/lib/function"
import {flatMap, map, parse, regex, string} from "../src"

// ============================================================
// keywords
// ============================================================
const LetKeyword = string("let")

// ============================================================
// identifiers
// ============================================================
type Identifier = {
  readonly _tag: "Identifier"
  readonly text: string
}

function createIdentifier(text: string): Identifier {
  return {
    _tag: "Identifier",
    text: text.trim()
  }
}

const Identifier = flow(regex(/\s*[a-z]+(_[a-z]+)*\s*/), map(createIdentifier))

// ============================================================
// symbols
// ============================================================
const Equals = string("=")

// ============================================================
// literals
// ============================================================
type StringLiteral = {
  readonly _tag: "StringLiteral"
  readonly text: string
}

function createStringLiteral(text: string): StringLiteral {
  return {
    _tag: "StringLiteral",
    text: text.trim()
  }
}

const StringLiteral = flow(regex(/\s*".*"\s*/), map(createStringLiteral))

// ============================================================
// constant declaration
// ============================================================
type ConstantDeclaration = {
  readonly _tag: "ConstantDeclaration"
  readonly identifier: Identifier
  readonly value: StringLiteral
}

function createConstantDeclaration(identifier: Identifier, value: StringLiteral): ConstantDeclaration {
  return {
    _tag: "ConstantDeclaration",
    identifier,
    value
  }
}

const ConstantDeclaration = flow(
  LetKeyword,
  flatMap(() => Identifier),
  flatMap(identifier =>
    flow(
      Equals,
      map(() => identifier)
    )
  ),
  flatMap(identifier =>
    flow(
      StringLiteral,
      map(value => createConstantDeclaration(identifier, value))
    )
  )
)

// ============================================================
// utils
// ============================================================
function prettyPrint(object: unknown): void {
  console.log(JSON.stringify(object, null, 2))
}

// ============================================================
// example
// ============================================================
pipe(parse('let foo = "foo"'), ConstantDeclaration, prettyPrint)
