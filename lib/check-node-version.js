const chalk = require('chalk')

module.exports = function checkNodeVersion() {
  const [major] = process.version.substring(1).split(/\./)

  if (parseInt(major) < 8) {
    console.log('')
    console.log(`React Storefront requires node v8 or newer. You're running node ${process.version}.`)
    console.log('')
    process.exit(0)
  }
}
