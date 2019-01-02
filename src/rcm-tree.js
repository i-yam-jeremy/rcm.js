const IGNORED_PARSE_TREE_FIELDS = ['start', 'end', 'loc']

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
  'ArrowFunctionExpression': (n) => {
    return  '((' +
            n.params.map(compileNode).join(', ') +
            ') => ' +
            compileNode(n.body) +
            ')'
  },
  'BlockStatement': (n) => '{\n' + n.body
                                  .map(compileNode)
                                  .map(s => '\t' + s)
                                  .join('\n')
                                + '\n}',
  'ReturnStatement': (n) => 'return ' + compileNode(n.argument),
  'BinaryExpression': (n) => '(' + compileNode(n.left)
                                 + n.operator
                                 + compileNode(n.right)
                                 + ')',
  'NumericLiteral': (n) => n.value.toString(),
  'Identifier': (n) => n.name,

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
