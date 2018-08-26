if (typeof window === 'object') {
  module.exports = require('./lib/browser').default;
} else {
  module.exports = require('./lib/node').default;
}
