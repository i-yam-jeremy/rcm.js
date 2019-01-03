const IGNORED_PARSE_TREE_FIELDS = ['start', 'end', 'loc', 'extra', '__clone']

function isParseTreeNode(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Node'
}

function isArray(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Array'
}

function visitNode(node, nodeMatchType, callback) {
  for (let field in node) {
    let fieldValue = node[field]

    if (fieldValue instanceof RcmTreeNode) {
      visitNode(fieldValue, nodeMatchType, callback)
    }
    else if (fieldValue instanceof Array) {
      for (let element of fieldValue) {
        if (element instanceof RcmTreeNode) {
          visitNode(element, nodeMatchType, callback)
        }
      }
    }
  }

  if (node.type == nodeMatchType) {
    callback(node)
  }
}

const NODE_COMPILERS = {
  'File': (n) => compileNode(n.program),
  'Program': (n) => n.body.map(compileNode).join('\n'),
  'ExpressionStatement': (n) => compileNode(n.expression),
  'ArrowFunctionExpression': (n) => '((' +
                                     n.params.map(compileNode).join(', ') +
                                     ') => ' +
                                     compileNode(n.body) +
                                     ')',
  'BlockStatement': (n) => '{\n' +
                              n.body
                                .map(compileNode)
                                .map(s => '\t' + s)
                                .join('\n') +
                            '\n}',
  'ReturnStatement': (n) => 'return ' + compileNode(n.argument),
  'BinaryExpression': (n) => '(' +
                              compileNode(n.left) +
                              ' ' + n.operator + ' ' +
                              compileNode(n.right) +
                              ')',
  'NumericLiteral': (n) => JSON.stringify(n.value),
  'StringLiteral': (n) => JSON.stringify(n.value),
  'BooleanLiteral': (n) => JSON.stringify(n.value),
  'Identifier': (n) => n.name,
  'ThisExpression': (n) => 'this',
  'CallExpression': (n) => '(' +
                            compileNode(n.callee) +
                            '(' +
                            n.arguments.map(compileNode).join(', ') +
                            '))',
  'MemberExpression': (n) => '(' +
                              compileNode(n.object) +
                              '.' +
                              compileNode(n.property) +
                              ')',
  'AssignmentExpression': (n) => '(' +
                                  compileNode(n.left) +
                                  n.operator +
                                  compileNode(n.right) +
                                  ')',
  'FunctionDeclaration': (n) => '(' +
                                 (n.async ? 'async ' : '') +
                                 'function' +
                                 (n.generator ? '*' : '') +
                                 ' ' +
                                 compileNode(n.id) +
                                 '(' + n.params.map(compileNode).join(', ') + ')' +
                                 compileNode(n.body) +
                                 ')',
  'ClassDeclaration': (n) => '(class ' + compileNode(n.id) +
                              (n.superClass ? ' extends ' + compileNode(n.superClass) : '') +
                              compileNode(n.body) +
                              ')',
  'ClassBody': (n) => '{\n' +
                        n.body
                          .map(compileNode)
                          .map(s => '\t' + s)
                          .join('\n') +
                      '\n}',
  'ClassMethod': (n) => (n.static ? 'static ' : '') +
                        (n.async ? 'async ' : '') +
                        (n.generator ? '*' : '') +
                        (n.kind == 'get' ? 'get ' : '') +
                        (n.kind == 'set' ? 'set ' : '') +
                        compileNode(n.key) +
                        '(' + n.params.map(compileNode).join(', ') + ')' +
                        compileNode(n.body),
  'VariableDeclaration': (n) => n.kind + ' ' +
                                 n.declarations.map(compileNode).join(', '),
  'VariableDeclarator': (n) => compileNode(n.id) + (n.init ? '=' + compileNode(n.init) : ''),
  'ObjectExpression': (n) => '({' + n.properties.map(compileNode).join(', ') + '})',
  'ObjectProperty': (n) => compileNode(n.key) + ': ' + compileNode(n.value), // TODO add method type values (since that's allowed in new version of ECMAScript)
  'ArrayExpression': (n) => '([' + n.elements.map(compileNode).join(', ') + '])',
  'NewExpression': (n) => '(new ' +
                            compileNode(n.callee) +
                            '(' +
                            n.arguments.map(compileNode).join(', ') +
                            '))',
  'UnaryExpression': (n) => '(' +
                             (n.prefix ? (n.operator == 'typeof' ? 'typeof ' : n.operator) : '') +
                             compileNode(n.argument) +
                             (!n.prefix ? (n.operator == 'typeof' ? 'typeof ' : n.operator) : '') +
                             ')',
  'UpdateExpression': (n) => '(' +
                              (n.prefix ? n.operator : '') +
                              compileNode(n.argument) +
                              (!n.prefix ? n.operator : '') +
                              ')',
  'SequenceExpression': (n) => '(' + n.expressions.map(compileNode).join(', ') + ')',
  'BreakStatement': (n) => (n.label ? 'break ' + compileNode(n.label) : 'break'),
  'ForInStatement': (n) => 'for (' +
                            compileNode(n.left) +
                            ' in ' +
                            compileNode(n.right) +
                            ') ' +
                            compileNode(n.body),
  'ForOfStatement': (n) => 'for (' +              // TODO figure out where n.await can be true (cause I can figure out the input syntax to trigger it)
                            compileNode(n.left) +
                            ' of ' +
                            compileNode(n.right) +
                            ') ' +
                            compileNode(n.body),
  'ForStatement': (n) => 'for (' +
                          compileNode(n.init) + ';' +
                          compileNode(n.test) + ';' +
                          compileNode(n.update) + ')' +
                          compileNode(n.body),
  'WhileStatement': (n) => 'while (' + compileNode(n.test) + ')' + compileNode(n.body),
  'IfStatement': (n) => 'if (' +
                         compileNode(n.test) +
                         ')' +
                         compileNode(n.consequent) +
                         'else {' + compileNode(n.alternate) + '}',
  'SwitchStatement': (n) => 'switch (' + compileNode(n.discriminant) + ') {\n' +
                             n.cases.map(compileNode).join('\n') +
                             '\n}',
  'SwitchCase': (n) => (n.test ? ('case ' + compileNode(n.test)) : 'default') +
                        ':\n' +
                        n.consequent.map(compileNode).join('\n'),
  'LabeledStatement': (n) => compileNode(n.label) + ': ' + compileNode(n.body),


  // Custom Nodes
  'InjectedCode': (n) => '(() => {\n' +
                         '(() => {\n' + n.code + '\n})()\n' +
                         'return ' + compileNode(n.oldNode) +
                         '})()',
  'InjectedModifier': (n) => '(' + n.code + ')(' + compileNode(n.oldNode) + ')'
}

function compileNode(node) {
  if (node.type in NODE_COMPILERS) {
    return NODE_COMPILERS[node.type](node)
  }
  else {
    throw 'Node type ' + node.type + ' not handled'
  }
}

class RcmTreeNode {

  constructor(node) {
    if (node instanceof RcmTreeNode) {
      for (let field in node) {
        this[field] = node[field]
      }
    }
    else {
      let parseTreeNode = node
      for (let field in parseTreeNode) {
        if (IGNORED_PARSE_TREE_FIELDS.indexOf(field) == -1) {
          let fieldValue = parseTreeNode[field]

          if (isParseTreeNode(fieldValue)) {
            fieldValue = new RcmTreeNode(fieldValue)
          }
          else if (isArray(fieldValue)) {
            fieldValue = fieldValue.map(x => isParseTreeNode(x) ? new RcmTreeNode(x) : x)
          }

          this[field] = fieldValue
        }
      }
    }
  }

  visit(nodeMatchType, callback) {
    visitNode(this, nodeMatchType, callback)
  }

  compile() {
    return compileNode(this)
  }

  // currently only works for expressions (things like variable declarations don't work)
  injectBefore(codeSource) {
    let oldNode = new RcmTreeNode(this)
    for (let field in this) {
      delete this[field]
    }

    this.type = 'InjectedCode'
    this.code = codeSource
    this.oldNode = oldNode
  }

  // currently only works for expressions (things like variable declarations don't work)
  injectModifier(codeSource) {
    let oldNode = new RcmTreeNode(this)
    for (let field in this) {
      delete this[field]
    }

    this.type = 'InjectedModifier'
    this.code = codeSource
    this.oldNode = oldNode
  }

}

module.exports = {
  RcmTreeNode
}
