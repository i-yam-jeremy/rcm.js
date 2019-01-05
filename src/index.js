const loader = require('./loader')

let rcmTree = loader.fromSource(`
let x = 10
let y = 2
let z = x*y
`)

rcmTree.visit('NumericLiteral', (node) => {
  if (node.parent.type == 'VariableDeclarator' && node.parent.id.name == 'x') {
    node.injectModifier('x => x+1')
  }
  /*node.injectModifier('x => x+1')
  node.injectModifier(`x => {
    if (x == 1) {
      return -1
    }
    else {
      return x
    }
  }`)*/
})

console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
