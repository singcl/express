var methods = require('methods')
var Route = require('./route')
var Layer = require('./layer')
var compose = require('./compose')

/**
 * @desc Express 加载全局中间件的方法
 * @param {String} path         请求路径
 * @param {Middleware} handler  全局中间件函数
 */
var use = function(path, handler) {
    // 如果use函数只提供一个中间件参数而不提供path的话
    // use(middleware)
    if (typeof handler !== 'function') {
        handler = path
        path = '/'
    }

    // 默认两个参数的处理
    // use(path, middleware)
    var layer = new Layer(path, handler)
    layer.route = undefined
    this.stack.push(layer)
    return this
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
proto.use       = use

/**
 * 私有方法内部使用
 * 接受客户端请求后，根据请求的path 生成第一级 Layer 层，Layer 中包含一个Route 实例
 * Route实例的 stack 队列中包含一系列 第二级Layer，第二级Layer是对 路由中间件 的封装
 * @param {String} path     路由路径字符串
 * @param {String} route    一个route 实例
 * @function stackLocalLayer
 * @private
 */
function stackLocalLayer(path, route) {
    // 指定compose函数的上下文
    // compose 函数作为 handler 传入
    var layer = new Layer(path, compose.bind(route))
    layer.route = route
    this.stack.push(layer)
}

/**
 * 遍历所有http请求方法，然后添加到router的原型对象上
 * 这样router实例就具有所有http 请求方法
 * @this Router实例对象
 */
methods.forEach(function(method) {
    proto[method] = function(path) {
        var route = new Route(path)
        // 执行route 的method 相关方法
        // 把一系列的路由中间件经Layer 包装后push 进route 的stack 中
        route[method].apply(route, Array.prototype.slice.call(arguments, 1))
        // 新建一个一级Layer push进 router 的stack 中
        stackLocalLayer.call(this, path, route)
        return this
    }
})

/* ================================================================= */
/**
 * @desc Router 不是真的的构造函数，类似工厂函数 （可直接执行 也可以new 执行）
 * @constructor
 */
function Router() {
    function router() {}
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
