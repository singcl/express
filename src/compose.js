var url = require('url')

/**
 * 客户端请求流处理函数
 * 来自客户端的所有HTTP请求都会经过此处理函数
 * 该处理函数内部由一系列中间件组成
 * @param {Object}                      req    request对象 Stream流
 * @param {Object}                      res    response对象 Stream流
 * @param {InnerExceededCallback} out    @singcl/express 内部默认的第一级Layer stack溢出时处理函数
 */
var compose = function(req, res, out) {
    var index = 0
    var ctx = this

    var pathname = url.parse(req.url, true).pathname

    // BUG:
    // 如果全局中间件后面紧跟一个路由中间件
    // 访问该路由时，全局中间件中 next 出来的 error 信息将会丢失
    function next(err) {
        if (index >= ctx.stack.length) {
            return out(err)
        }
        var layer = ctx.stack[index++]
        if (layer.match(pathname)) {
            if (!layer.route) {
                if (err) {
                    layer.handleError(err, req, res, next)
                } else {
                    layer.handleRequest(req, res, next)
                }
            } else {
                if (layer.route && layer.route.handleMethod(req.method)) {
                    layer.handleRequest(req, res, next)
                } else {
                    next(err)
                }
            }
        } else {
            next(err)
        }
    }
    next()
}

/**
 * @singcl/express 内部默认的第一级Layer stack溢出时处理函数
 * 
 * @callback InnerExceededCallback
 * @param {Any}      error    第一级Layer stack溢出时相关错误信息
 *
 */

/**
 * Express compose module
 * @module
 */
module.exports = compose
