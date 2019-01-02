const loader = require('./loader')

console.log(loader.fromSource(`
console.log('Hello')
`))

module.exports = {
  fromSource: loader.fromSource
}
