var Route = require('./route')
var Layer = require('./layer')
var url = require('url')
var methods = require('methods')

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
 * 创建一个没有原型的对象，该对象将作为Router实例的原型对象使用
 * JS继承基本分为两大类：类继承 和 原型继承
 * @namespace {Object} proto
 */ 
var proto = Object.create(null)

/**
 * 接受客户端请求后，根据请求的path 生成第一级 Layer 层，Layer 中包含一个Route 实例
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

// TODO
proto.use = function(path, handler) {
    if (typeof handler !== 'function') {
        handler = path
        path = '/'
    }

    var layer = new Layer(path, handler)
    layer.route = undefined
    this.stack.push(layer)
    return this
}

// TODO
methods.forEach(function(method) {
    proto[method] = function(path) {
        var route = this.route(path)
        route[method].apply(route, Array.prototype.slice.call(arguments, 1))
        return this 
    }
})

// TODO
proto.handle = function(req, res, out) {
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
 * This callback is displayed as part of the Application class.
 * http server 客户端请求回调函数.
 * 
 * @callback Router~requestCallback
 * @param {Object}   req  request对象 Stream流
 * @param {Object}   res  response对象 Stream流
 *
 */

// TODO
proto.route = route

/**
 * Express Router Constructor module
 * @module
 */
module.exports = Router
