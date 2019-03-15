const gql = require('apollo-server').gql
const mergeStrings = require('../dist/index').mergeStrings
const schema1 = `
"""ThingWithDesc"""
type ThingWithDesc {
  """Bar is a string"""
  bar: String
}`

const schema2 = `
  """This should have a comment description"""
type ThingWithDesc {
  """Bar is a string"""
  foo: Int
}`

let a = mergeStrings([schema1, schema2])

console.log(a)
