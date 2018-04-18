var pathToRegexp = require('path-to-regexp')

/**
 * @desc Layer
 * @constructor
 * @param {String} path 路由path路径
 * @param {Layer~handler} handler 处理路由的回调函数
 */
function Layer(path, handler) {
    this.path = path
    this.handler = handler
    this.keys = []
    // this.path =/user/:uuid   this.keys = [{name:'uuid', ...}]
    this.regexp = pathToRegexp(this.path, this.keys)
}

/**
 * This callback is displayed as part of the Layer class.
 * http server 客户端请求回调函数.
 * 
 * @callback Layer~handler
 * @param {Object}   req  request对象 Stream流
 * @param {Object}   res  response对象 Stream流
 *
 */

/**
 * @description 传入的路径是否匹配
 * @name Layer#match
 * @function
 * @param {String}  pathname  经url 模块解析出来的客户端请求路径
 */
Layer.prototype.match = function(pathname) {
    if (this.path === pathname) return true

    // 如果这个Layer是一个全局中间件的 Layer
    if (!this.route) {
        // app.use(function(req, res, next) {...})
        // all pathname will return true
        if (this.path === '/') return true
        // app.use('/blogs', function(req, res, next) {...})
        // pathname like this: '/blogs/blog' will return true.
        return pathname.startsWith(this.path + '/') 
    }

    // 如果这个Layer是一个类似/user/:uuid 的路由的 Layer
    if (this.route) {
        // 正则表达式exec
        var matches = this.regexp.exec(pathname)
        if (matches) { return true }
    }
    return false
}

/**
 * @description request处理函数
 * @name Layer#handleRequest
 * @function
 * @param {Object}  req     请求流
 * @param {Object}  res     响应流
 * @param {Object}  next    控制权转移
 */
Layer.prototype.handleRequest = function(req, res, next) {
    this.handler(req, res, next)
}

/**
 * @description request错误处理函数
 * @name Layer#handleError
 * @function
 * @param {Object}  err     错误处理
 * @param {Object}  req     请求流
 * @param {Object}  res     响应流
 * @param {Object}  next    控制权转移
 */
Layer.prototype.handleError = function(err, req, res, next) {
    if (this.handler.length !== 4) return next(err)
    this.handler(err, req, res, next)
}

/**
 * Express Layer Constructor module
 * @module
 */
module.exports = Layer
