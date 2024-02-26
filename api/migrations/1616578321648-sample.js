

module.exports.up = function (next) {
  console.log('Sample migration script');
  next()
}

module.exports.down = function (next) {
  next()
}
