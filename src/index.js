const loader = require('./loader')

let rcmTree = loader.fromSource(`
let b = typeof 10;

let c = -x

c++

let x = ([1, 2, 3]) instanceof Array

for (let key in {}) {
  doStuff()
}

for (var element of [1, 2, 3]) {
  doStuff()
}

for (let i = 0; i < 100; i++) {
  doStuff()
}

while (true) {
  doStuff()
}

if (10) {
  doStuff()
}
else if (11) {
  doStuff()
}
else {
  doStuff()
}


switch ('hi') {
  case '10': {
    doStuff()
    break
  }
  case '11':
    doStuff()
    break
  default:
    doStuff()
    break
}

label: for (let i = 0; i < 10; i++) {
  doStuff();
  break label
}
`)

/*
    * typeof
    * instanceof
    * for .. in
    * for .. of
    * standard for
    * while
    * if else
    * switch
  */

console.log(rcmTree)
console.log(rcmTree.compile())

module.exports = {
  fromSource: loader.fromSource
}
