/*!
 * @singcl/express
 * Copyright(c) 2018-2018 singcl
 * github: https://github.com/singcl/express
 * BSD-3 Licensed
 */
var EventEmitter = require('events').EventEmitter
var Application = require('./application')

/**
 * express Creator
 * @returns {Function} express app 实例
 */
function express() {
    var app = function(req, res, next) {}
    // 原型对象合并
    var proto = Object.assign({},  Application.prototype, EventEmitter.prototype)
    // 修改express app的原型链 __proto___
    Object.setPrototypeOf(app, proto)
    return app
}

/**
 * Express App Creator
 * @module
 */
module.exports = express
