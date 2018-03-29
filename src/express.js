const Application = require('./application')

/* // ES5
function createApplication() {
    return new Application()
}
module.exports = createApplication */

module.exports = () => new Application()
