const loader = require('./loader')

let rcmTree = loader.fromSource(`
async x => {
  return console.log('hi')
}
`)

console.log(rcmTree)
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
