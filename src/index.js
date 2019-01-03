const loader = require('./loader')

let rcmTree = loader.fromSource(`
let x = 10
let y = 2
let z = x*y
`)

for (let statement of rcmTree.program.body) {
  if (statement.type == 'VariableDeclaration') {
    for (let declaration of statement.declarations) {
      if (declaration.init && declaration.init.type == 'NumericLiteral') {
        declaration.init.injectModifier('(x) => { console.log("Number literal: " + x); return x+1; }')
      }
    }
  }
}
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
