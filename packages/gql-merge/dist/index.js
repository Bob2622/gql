#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeFileGlob = mergeFileGlob;
exports.mergeFilePaths = mergeFilePaths;
exports.mergeStrings = mergeStrings;
exports.mergeString = mergeString;
exports.mergeAst = mergeAst;
exports.cli = cli;
exports.cliAction = cliAction;
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _language = require("graphql/language");

var _gqlFormat = require("gql-format");

var _gqlUtils = require("gql-utils");

var _package = require("../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = {
  mergeFileGlob: mergeFileGlob,
  mergeFilePaths: mergeFilePaths,
  mergeStrings: mergeStrings,
  mergeString: mergeString,
  mergeAst: mergeAst
  /**
   * Find GraphQL files based on a glob pattern and merge the results.
   * @param {string} fileGlob - A glob pattern to find files, e.g. '*.graphql'
   * @return {Promise<string>} A promise of the resulting string.
   */

};
exports.default = _default;

function mergeFileGlob(_x) {
  return _mergeFileGlob.apply(this, arguments);
}
/**
 * Find GraphQL files based on a glob pattern and merge the results.
 * @param {string} fileGlob - A glob pattern to find files, e.g. '*.graphql'
 * @return {Promise<string>} A promise of the resulting string.
 */


function _mergeFileGlob() {
  _mergeFileGlob = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(fileGlob) {
    var fileDetails, fileContents;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _gqlUtils.readFileGlob)(fileGlob);

          case 2:
            fileDetails = _context.sent;
            fileContents = fileDetails.map(function (f) {
              return f.fileContents;
            });
            return _context.abrupt("return", mergeStrings(fileContents));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _mergeFileGlob.apply(this, arguments);
}

function mergeFilePaths(_x2) {
  return _mergeFilePaths.apply(this, arguments);
}
/**
 * Merges an array of GraphQL strings into one
 * @param {string[]} schemaStrs - An array of GraphQL strings.
 * @return {string} The resulting merged GraphQL string.
 */


function _mergeFilePaths() {
  _mergeFilePaths = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(filePaths) {
    var fileDetails, fileContents;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _gqlUtils.readFilePaths)(filePaths);

          case 2:
            fileDetails = _context2.sent;
            fileContents = fileDetails.map(function (f) {
              return f.fileContents;
            });
            return _context2.abrupt("return", mergeStrings(fileContents));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _mergeFilePaths.apply(this, arguments);
}

function mergeStrings(schemaStrs) {
  console.log('--------------- mergeStrings');
  console.log(schemaStrs);
  var schemaStr = schemaStrs.join('\n\n');
  return mergeString(schemaStr);
}
/**
 * Merges duplicate definitions in a single GraphQL string
 * @param {string} schemaStr - The GraphQL String.
 * @return {string} The resulting merged GraphQL string.
 */


function mergeString(schemaStr) {
  console.log('-------------- schemaStr11111');
  console.log(schemaStr);
  var schemaAst = (0, _language.parse)(schemaStr);
  return mergeAst(schemaAst);
}
/**
 * Merges duplicate definitions in a single GraphQL abstract-syntax tree
 * @param {Document} schemaAst - The GraphQL AST.
 * @return {string} The resulting merged GraphQL string.
 */


function mergeAst(schemaAst) {
  console.log('---------- schemaAst');
  console.log(schemaAst);
  var typeDefs = {}; // Go through the AST and extract/merge type definitions.

  var editedAst = (0, _language.visit)(schemaAst, {
    enter: function enter(node) {
      var nodeName = node.name ? node.name.value : null; // Don't transform TypeDefinitions directly

      if (!nodeName || !node.kind.endsWith('TypeDefinition')) {
        return;
      }

      var oldNode = typeDefs[nodeName];

      if (!oldNode) {
        // First time seeing this type so just store the value.
        typeDefs[nodeName] = node;
        return null;
      } // This type is defined multiple times, so merge the fields and values.


      var concatProps = ['fields', 'values', 'types'];
      concatProps.forEach(function (propName) {
        if (node[propName] && oldNode[propName]) {
          node[propName] = oldNode[propName].concat(node[propName]);
        }
      });
      typeDefs[nodeName] = node;
      return null;
    }
  });
  var remainingNodesStr = (0, _gqlFormat.formatAst)(editedAst);
  var typeDefsStr = Object.values(typeDefs).map(_gqlFormat.formatAst).join('\n');
  var fullSchemaStr = "".concat(remainingNodesStr, "\n\n").concat(typeDefsStr);
  return (0, _gqlFormat.formatString)(fullSchemaStr);
}

function cli() {
  return _cli.apply(this, arguments);
}

function _cli() {
  _cli = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var program,
        command,
        _args4 = arguments;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            program = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : _commander.default;

            if (module.parent) {
              _context4.next = 9;
              break;
            }

            program.version(_package.version).usage('[options] <glob ...>');
            cliAddHelp(cliAddBasics(program));
            program.parse(process.argv);
            _context4.next = 7;
            return cliAction(program, program.args, program);

          case 7:
            _context4.next = 12;
            break;

          case 9:
            command = program.command('merge <glob ...>');
            cliAddHelp(cliAddBasics(command));
            command.action(
            /*#__PURE__*/
            function () {
              var _ref2 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee3(inputGlob, options) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return cliAction(command, inputGlob.split(' '), options);

                      case 2:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x4, _x5) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _cli.apply(this, arguments);
}

function cliAddBasics(command) {
  return command.description(_package.description).option('-o, --out-file <path>', 'Output GraphQL file, otherwise use stdout');
}

function cliAddHelp(command) {
  var commandName = !module.parent ? 'gql-merge' : 'gql merge';
  return command.on('--help', function () {
    return console.log("  Examples:\n    $ ".concat(commandName, " **/*.graphql > schema.graphql\n    $ ").concat(commandName, " -o schema.graphql **/*.graphql\n    $ ").concat(commandName, " dir1/*.graphql dir2/*.graphql > schema.graphql\n  "));
  });
}

function cliAction(_x3) {
  return _cliAction.apply(this, arguments);
}

function _cliAction() {
  _cliAction = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(program) {
    var fileGlobs,
        _ref,
        outFile,
        mergeGlobsPromises,
        schemaStrs,
        schemaStr,
        _args5 = arguments;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            fileGlobs = _args5.length > 1 && _args5[1] !== undefined ? _args5[1] : [];
            _ref = _args5.length > 2 ? _args5[2] : undefined, outFile = _ref.outFile;

            if (fileGlobs.length) {
              _context5.next = 4;
              break;
            }

            return _context5.abrupt("return", program.help());

          case 4:
            mergeGlobsPromises = fileGlobs.map(mergeFileGlob);
            _context5.next = 7;
            return Promise.all(mergeGlobsPromises);

          case 7:
            schemaStrs = _context5.sent;
            schemaStr = mergeStrings(schemaStrs);

            if (!outFile) {
              _context5.next = 14;
              break;
            }

            _context5.next = 12;
            return (0, _gqlUtils.writeFileObject)({
              filePath: outFile,
              fileContents: schemaStr
            });

          case 12:
            _context5.next = 15;
            break;

          case 14:
            console.log(schemaStr);

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _cliAction.apply(this, arguments);
}

if (!module.parent) {
  cli();
}
