'use strict'

var methods = require('methods')
var Layer = require('./layer')

/**
 * @desc Route 路由构造函数
 * @constructor
 * @param {String} path 路由path路径
 */
function Route(path) {
    this.path = path
    this.stack = []
    // 表示当前路由拥有相应方法的处理函数
    // {get: true, post: true, put: true}
    this.methods = {}
}

/**
 * @desc HTTP METHOD NAME
 * @function
 * @name Route#handleMethod
 * @param {String} method HTTP METHOD NAME
 */
Route.prototype.handleMethod = function(method) {
    var m = method.toLowerCase()
    return this.methods[m]
}

/**
 * @desc Array forEach 在路由原型上添加常用的HTTP METHOD
 */
methods.forEach(function(method) {
    Route.prototype[method] = function() {
        var handlers = Array.prototype.slice.call(arguments)
        this.methods[method] = true
        for(var i = 0; i < handlers.length; i++) {
            var layer = new Layer('/', handlers[i])
            layer.method = method
            this.stack.push(layer)
        }
    }
    return this
})

// /**
//  * @desc 客户端发起http请求后，通过该方法实现了两层Layer的遍历
//  * @function
//  * @name Route#dispatch
//  * @param {Object}  req     请求流
//  * @param {Object}  res     响应流
//  * @param {Object}  out     控制权转移
//  */
// Route.prototype.dispatch = function(req, res, out) {
//     var index = 0
//     var self = this
//     function next(err) {
//         if (err) return out(err)
//         if (index >= self.stack.length) return out()
//         var layer = self.stack[index++]
//         if (layer.method === req.method.toLowerCase()) {
//             layer.handleRequest(req, res, next)
//         } else {
//             next()
//         }
//     }
//     next() 
// }

/**
 * Express Route Constructor module
 * @module
 */
module.exports = Route
