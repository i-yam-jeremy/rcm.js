const IGNORED_PARSE_TREE_FIELDS = ['start', 'end', 'loc']

function isParseTreeNode(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Node'
}

function isArray(value) {
  return value && typeof value == 'object' && value.constructor.name == 'Array'
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

}

module.exports = {
  RcmTreeNode
}
