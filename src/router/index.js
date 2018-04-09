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
    // 声明一个对象，用来缓存路径参数名它对应的回调函数数组
    router.paramCallbacks = {}
    return router
}

// 创建一个没有原型的对象，该对象将作为Router实例的原型对象使用
var proto = Object.create(null)


proto.route = function(path) {
    var route = new Route(path)
    var layer = new Layer(path, route.dispatch.bind(route))
    layer.route = route
    this.stack.push(layer)
    return route
}

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

methods.forEach(function(method) {
    proto[method] = function(path) {
        var route = this.route(path)
        route[method].apply(route, Array.prototype.slice.call(arguments, 1))
        return this
    }
})

proto.param = function(name, handler) {
    if (!this.paramCallbacks[name]) {
        this.paramCallbacks[name] = []
    }
    this.paramCallbacks[name].push(handler)
}

proto.handle = function(req, res, out) {
    var idx = 0
    var self = this
    var slashAdded = false
    var removed = ''

    var pathname = url.parse(req.url, true).pathname
    // eslint-disable-next-line
    function next(err) {
        if (slashAdded) {
            req.url = ''
            slashAdded = false
        }

        if (removed.length > 0) {
            req.url = removed + req.url
            removed = ''
        }
        if (idx >= self.stack.length) {
            return out(err)
        }
        var layer = self.stack[idx++]
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
                    req.params = layer.params
                    self.processParams(layer, req, res, function() {
                        layer.handleRequest(req, res, next)
                    })
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

proto.processParams = function(layer, req, res, out) {
    var keys = layer.keys
    var self = this

    var paramIndex = 0
    var key, name, val, callbacks, callback

    function param() {
        if (paramIndex >= keys.length) {
            return out()
        }
        key = keys[paramIndex++]
        name = key.name
        val = layer.params[name]
        callbacks = self.paramCallbacks[name]
        if (!val || !callbacks) {
            return param()
        }
        execCallback()
    }

    var callbackIndex = 0
    function execCallback() {
        callback = callbacks[callbackIndex++]
        if (!callback) {
            return param()
        }
        callback(req, res, execCallback, val, name)
    }
    param()
}

module.exports = Router
