const loader = require('./loader')

let rcmTree = loader.fromSource(`
class X extends Array {

  constructor(x, y) {
    this.x = y
  }

  get x() {
    return 7
  }

  set x(y) {
    this.x = 7
  }

  get testMethod() {
    let x = 10
    const y = 2
    var z = 43

    var x2, y2 = 8, z2
  }

}
`)

console.log(rcmTree)
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
