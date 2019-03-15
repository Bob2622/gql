#!/usr/bin/env node
/* @flow */
import commander from 'commander'
import {parse,visit,} from 'graphql/language'
import {formatString, formatAst} from 'gql-format'
import {readFileGlob, readFilePaths, writeFileObject,} from 'gql-utils'
import {version, description,} from '../package.json'

export default {
  mergeFileGlob,
  mergeFilePaths,
  mergeStrings,
  mergeString,
  mergeAst,
}

/**
 * Find GraphQL files based on a glob pattern and merge the results.
 * @param {string} fileGlob - A glob pattern to find files, e.g. '*.graphql'
 * @return {Promise<string>} A promise of the resulting string.
 */
export async function mergeFileGlob(fileGlob: string): Promise<string> {
  const fileDetails = await readFileGlob(fileGlob)
  const fileContents = fileDetails.map(f => f.fileContents)
  return mergeStrings(fileContents)
}

/**
 * Find GraphQL files based on a glob pattern and merge the results.
 * @param {string} fileGlob - A glob pattern to find files, e.g. '*.graphql'
 * @return {Promise<string>} A promise of the resulting string.
 */
export async function mergeFilePaths(filePaths: string[]): Promise<string> {
  const fileDetails = await readFilePaths(filePaths)
  const fileContents = fileDetails.map(f => f.fileContents)
  return mergeStrings(fileContents)
}

/**
 * Merges an array of GraphQL strings into one
 * @param {string[]} schemaStrs - An array of GraphQL strings.
 * @return {string} The resulting merged GraphQL string.
 */
export function mergeStrings(schemaStrs: string[]): string {
  const schemaStr: string = schemaStrs.join('\n\n')
  return mergeString(schemaStr)
}

/**
 * Merges duplicate definitions in a single GraphQL string
 * @param {string} schemaStr - The GraphQL String.
 * @return {string} The resulting merged GraphQL string.
 */
export function mergeString(schemaStr: string): string {
  const schemaAst: Document = parse(schemaStr)
  return mergeAst(schemaAst)
}

/**
 * Merges duplicate definitions in a single GraphQL abstract-syntax tree
 * @param {Document} schemaAst - The GraphQL AST.
 * @return {string} The resulting merged GraphQL string.
 */
function mergeAst(schemaAst) {
  var typeDefs = {};

  // Go through the AST and extract/merge type definitions.
  var editedAst = (0, _language.visit)(schemaAst, {
    enter: function enter(node) {
      var nodeName = node.name ? node.name.value : null;

      // Don't transform TypeDefinitions directly
      if (!nodeName || !node.kind.endsWith('TypeDefinition')) {
        return;
      }

      var oldNode = typeDefs[nodeName];

      var deduplication = function (node, oldNode) {
        var concatProps = ['fields', 'values', 'types'];
        concatProps.forEach(propName => {
          if (!node[propName] && !oldNode[propName]) return;
          var fields = [];
          if (node[propName]) {
            fields = fields.concat(node[propName]);
          }
          if (oldNode[propName]) {
            fields = fields.concat(oldNode[propName]);
          }

          console.log(fields)
          let names = [];
          let fieldSet = [];
          fields.forEach(field => {
            if (!names.includes(field.name.value)) {
              names.push(field.name.value);
              fieldSet.push(field);
            }
          });
          node[propName] = fieldSet;
        })
        return node;
      }

      if (!oldNode) {
        // First time seeing this type so just store the value.
        typeDefs[nodeName] = deduplication(node, []);
        return null;
      }

      // This type is defined multiple times, so merge the fields and values.
      deduplication(node, oldNode)

      typeDefs[nodeName] = node;
      return null;
    }
  });

  var remainingNodesStr = (0, _gqlFormat.formatAst)(editedAst);
  var typeDefsStr = (0, _values2.default)(typeDefs).map(_gqlFormat.formatAst).join('\n');
  var fullSchemaStr = remainingNodesStr + '\n\n' + typeDefsStr;

  return (0, _gqlFormat.formatString)(fullSchemaStr);
}

export async function cli(program=commander) {
  if (!module.parent) {
    program
      .version(version)
      .usage('[options] <glob ...>')

    cliAddHelp(cliAddBasics(program))

    program.parse(process.argv)
    await cliAction(program, program.args, program)
  } else {
    const command = program.command('merge <glob ...>')
    cliAddHelp(cliAddBasics(command))
    command.action(async (inputGlob, options) => {
      await cliAction(command, inputGlob.split(' '), options)
    })
  }
}

function cliAddBasics(command) {
  return command
    .description(description)
    .option('-o, --out-file <path>', 'Output GraphQL file, otherwise use stdout')
}

function cliAddHelp(command) {
  const commandName =
    !module.parent
      ? 'gql-merge'
      : 'gql merge'
  return command.on('--help', () => console.log(`  Examples:
    $ ${commandName} **/*.graphql > schema.graphql
    $ ${commandName} -o schema.graphql **/*.graphql
    $ ${commandName} dir1/*.graphql dir2/*.graphql > schema.graphql
  `))
}

export async function cliAction(program, fileGlobs=[], {outFile}) {
  if (!fileGlobs.length) {
    return program.help()
  }

  const mergeGlobsPromises = fileGlobs.map(mergeFileGlob)
  const schemaStrs = await Promise.all(mergeGlobsPromises)
  const schemaStr = mergeStrings(schemaStrs)

  if (outFile) {
    await writeFileObject({
      filePath: outFile,
      fileContents: schemaStr,
    })
  } else {
    console.log(schemaStr)
  }
}

if (!module.parent) {
  cli()
}
