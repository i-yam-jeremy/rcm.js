const loader = require('./loader')

let rcmTree = loader.fromSource(`
x => {
  return x+2
}
`)

console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
