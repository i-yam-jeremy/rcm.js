const IGNORED_PARSE_TREE_FIELDS = ['start', 'end', 'loc', 'extra', '__clone']

function isParseTreeNode(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Node'
}

function isArray(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Array'
}

const NODE_COMPILERS = {
  'File': (n) => compileNode(n.program),
  'Program': (n) => n.body.map(compileNode).join('\n'),
  'ExpressionStatement': (n) => compileNode(n.expression),
  'ArrowFunctionExpression': (n) => { // TODO use node.generator property
    return  '(' +
            (n.async ? 'async ' : '') +
            '(' +
            n.params.map(compileNode).join(', ') +
            ') => ' +
            compileNode(n.body) +
            ')'
  },
  'BlockStatement': (n) => '{\n' +
                              n.body
                                .map(compileNode)
                                .map(s => '\t' + s)
                                .join('\n') +
                            '\n}',
  'ReturnStatement': (n) => 'return ' + compileNode(n.argument),
  'BinaryExpression': (n) => '(' +
                              compileNode(n.left) +
                              n.operator +
                              compileNode(n.right) +
                              ')',
  'NumericLiteral': (n) => JSON.stringify(n.value),
  'StringLiteral': (n) => JSON.stringify(n.value),
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
  'VariableDeclarator': (n) => compileNode(n.id) + (n.init ? '=' + compileNode(n.init) : '')


  /*
    // TODO:

    * array literal
    * object literal

  */



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

  constructor(parseTreeNode) {
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

  compile() {
    return compileNode(this)
  }

}

module.exports = {
  RcmTreeNode
}
