/*!
 * @singcl/express
 * Copyright(c) 2018-2018 singcl
 * github: https://github.com/singcl/express
 * BSD-3 Licensed
 */

const Application = require('./application')

// exports function that return instance of Application
module.exports = function() {
    return new Application()
}
