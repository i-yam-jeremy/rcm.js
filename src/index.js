const loader = require('./loader')

let rcmTree = loader.fromSource(`
let a = {a: 10, "hello": 73}
let b = [1, 2, 3, 4]
let g = new Array(10)
`)

console.log(rcmTree)
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
