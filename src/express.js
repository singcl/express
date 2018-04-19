/*!
 * @singcl/express
 * Copyright(c) 2018-2018 singcl
 * github: https://github.com/singcl/express
 * BSD-3 Licensed
 */

'use strict'

/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
var mixin = require('merge-descriptors')
var proto = require('./application')

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */
function express() {
    var app = function(req, res, next) {
        app.handle(req, res, next)
    }

    mixin(app, EventEmitter.prototype, false)
    mixin(app, proto, false)

    app.init()

    return app
}

/**
 * Expose `createApplication()`.
 * @module
 */
exports = module.exports = express
