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

    // BUG FIXED
    // 如果全局中间件后面紧跟一个路由中间件
    // 访问该路由时，全局中间件中 next 出来的 error 信息将会丢失
    /**
     * next 函数递归调用
     * 每调用一次next router stack栈中的layer 就出栈一个
     * @param {*} err next 函数抛出的错误信息
     */
    function next(err) {
        // 没有找到当前处理当前pathname的layer层就调用在application 中传入的Inner default 错误处理函数out
        if (index >= ctx.stack.length) return out(err)
        // 每调用一次next router.stack的指针+1
        var layer = ctx.stack[index++]

        // 如果调用next 传入了error信息则开始寻找错误处理layer层(length值为4的layer.handler)
        // 由于所有的路由layer层是这样`layer = new Layer(path, route.dispatch.bind(route))`
        // 构造的，所以所有的路由layer的layer.handler的length === 0
        // 所以错误处理layer必定在全局layer中切hander有四个参数
        if (err) return layer.handleError(err, req, res, next)
        
        // 当前请求的pathname 匹配到了一个layer层（全局layer > 路由layer）
        if (layer.match(pathname)) {
            // 如果是由use方法载入的全局layer
            if (!layer.route) {
                // 执行layer.handler
                // 也就是执行全局的middleware 同时把next 函数本身作为参数传入
                // 如果next函数在middleware中没有被调用则当前整个执行上下文（全局的调用堆栈）依次出栈
                // 如果next函数被调用则在当前整个执行上下文（全局的调用堆栈）栈顶再入栈一个next执行上下文
                layer.handleRequest(req, res, next)
            } else {
                // 如果是由http method载入的路由layer
                // 且当前layer的method === 客户端请求的method
                if (layer.route.handleMethod(req.method)) {
                    // 执行layer.handler
                    // 这里layer.handler === route.dispatch.bind(route)
                    // 所以查看Route.prototype.dispatch方法了解第二层layer(一系列路由中间件的包装)的执行过程
                    layer.handleRequest(req, res, next)
                } else {
                    // 如果是由http method载入的路由layer
                    // 但是当前layer的method !== 客户端请求的method
                    // 则直接入栈下一个layer的执行上下文
                    next()
                }
            }
        } else {
            // 当前请求的pathname 与当前layer层不匹配
            // 则直接入栈下一个layer的执行上下文
            next()
        }
    }

    // 启动next 第一个layer入栈
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
