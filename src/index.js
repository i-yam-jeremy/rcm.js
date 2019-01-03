const loader = require('./loader')

let rcmTree = loader.fromSource(`
let x = 10
let y = 2
let z = x*y
`)

rcmTree.visit('NumericLiteral', (node) => {
  node.injectModifier('x => x+1')
})

console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
