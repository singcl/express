var Route = require('./route')
var Layer = require('./layer')
var url = require('url')
var methods = require('methods')

/**
 * @desc Express 加载全局中间件的方法
 * @param {String} path         请求路径
 * @param {Middleware} handler  全局中间件函数
 */
var use = function(path, handler) {
    if (typeof handler !== 'function') {
        handler = path
        path = '/'
    }

    var layer = new Layer(path, handler)
    layer.route = undefined
    this.stack.push(layer)
    return this
}

/**
 * 接受客户端请求后，根据请求的path 生成第一级 Layer 层，Layer 中包含一个Route 实例  ？？？
 * Route实例的 stack 队列中包含一系列 第二级Layer，第二级Layer是对 路由中间件 的封装 ？？？
 * @param {String} path 路由路径字符串
 * @memberof proto
 * @function
 * @name route
 * @returns {Object} 返回一个Route实例
 */
var route = function(path) {
    var route = new Route(path)
    var layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route
    this.stack.push(layer)
    return route
}

/**
 * 客户端请求流处理函数
 * 来自客户端的所有HTTP请求都会经过此处理函数
 * 该处理函数内部由一系列中间件组成
 * @param {Object}                      req    request对象 Stream流
 * @param {Object}                      res    response对象 Stream流
 * @param {proto~InnerExceededCallback} out    @singcl/express 内部默认的第一级Layer stack溢出时处理函数
 */
var handle = function(req, res, out) {
    var index = 0
    var self = this
    var slashAdded = false
    var removed = ''

    var pathname = url.parse(req.url, true).pathname
    function next(err) {
        if (slashAdded) {
            req.url = ''
            slashAdded = false
        }

        if (removed.length > 0) {
            req.url = removed + req.url
            removed = ''
        }
        if (index >= self.stack.length) {
            return out(err)
        }
        var layer = self.stack[index++]
        if (layer.match(pathname)) {
            if (!layer.route) {
                removed = layer.path
                req.url = req.url.slice(removed.length)
                if (err) {
                    layer.handleError(err, req, res, next)
                } else {
                    if (req.url === '') {
                        req.url = '/'
                        slashAdded = true
                    }
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
 * This callback is displayed as a global member.
 * Express 中间件函数
 * 
 * @callback Middleware
 * @param {Object}      req    request对象 Stream流
 * @param {Object}      res    response对象 Stream流
 * @param {Function}    next   next函数-当前layer出栈，下一个layer入栈。即执行权交给下个中间件
 *
 */

/**
 * @singcl/express 内部默认的第一级Layer stack溢出时处理函数
 * 
 * @callback proto~InnerExceededCallback
 * @param {Any}      error    第一级Layer stack溢出时相关错误信息
 *
 */

/* ================================================================= */
/**
 * 创建一个没有原型的对象，该对象将作为Router实例的原型对象使用
 * JS继承基本分为两大类：类继承 和 原型继承
 * @namespace {Object} proto
 */ 
var proto = Object.create(null)

/**
 * 路由原型对象上添加相关方法
 */
proto.handle = handle
proto.route = route
proto.use   = use

/**
 * 遍历所有http请求方法，然后添加到router的原型对象上
 * 这样router实例就具有所有http 请求方法
 */
methods.forEach(function(method) {
    proto[method] = function(path) {
        var route = this.route(path)
        route[method].apply(route, Array.prototype.slice.call(arguments, 1))
        return this 
    }
})

/**
 * @desc Router 不是真的的构造函数，类似工厂函数 （可直接执行 也可以new 执行）
 * @constructor
 */
function Router() {
    function router(req, res, next) {
        router.handle(req, res, next)
    }
    Object.setPrototypeOf(router, proto)
    router.stack = []
    // // 声明一个对象，用来缓存路径参数名它对应的回调函数数组
    // router.paramCallbacks = {}
    return router
}

/**
 * Express Router Constructor module
 * @module
 */
module.exports = Router
