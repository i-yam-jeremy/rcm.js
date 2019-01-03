const loader = require('./loader')

let rcmTree = loader.fromSource(`
let x = 10
let y = 2
let z = x*y
`)

console.log(rcmTree)
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
