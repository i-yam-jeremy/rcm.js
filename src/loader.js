const babelParser = require('@babel/parser')
const rcmTree = require('./rcm-tree')

function fromSource(source) {
  const parseTree = babelParser.parse(source)
  return new rcmTree.RcmTreeNode(parseTree)
}

module.exports = {
  fromSource
}
