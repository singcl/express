var http = require('http')
// var url = require('url')
var Router = require('./router')
var methods = require('methods')

/**
 * @description Express Application 构造函数
 * @constructor
 * @public
 */
function Application() {
    this.settings = {}
}

/**
 * @desc express 实例上增加router实例
 * @function Application#lazyRouter
 */
Application.prototype.lazyRouter = function() {
    if (this._router) this._router = new Router()
}

// /**
//  * @desc express param
//  * @function Application#param
//  * @param {String} name param name
//  * @param {Application~paramCallback} handler param处理函数,param校验函数
//  * @todo paramCallback 定义
//  */
// Application.prototype.param = function(name, handler) {
//     this.lazyRouter()
//     this._router.param.apply(this._router, [name, handler])
// }

/**
 * @desc express 实例上增加路由方法
 * 实际是调用router实例上的方法
 */
methods.forEach(function(method) {
    Application.prototype[method] = function() {
        this.lazyRouter()
        this._router[method].apply(this._router, Array.prototype.slice.call(arguments))
        return this
    }
})

/**
 * @desc 添加中间件，而中间件和普通的路由都是放在一个数组中的，放在this._router.stack
 */
Application.prototype.use = function() {
    this.lazyRouter()
    this._router.use.apply(this._router, arguments)
}

/**
 * @desc 原型方法 listen 对node http 相关方法的封装，启动一个http 服务
 * @name Application#listen
 * @function
 * @param {Number=}  port Express 服务器启动的端口
 * @param {Application~serverSuccessCallback=} cb - http server 成功启动后的回调函数
 * @see 这里只列出常用参数。具体参数列表请查看{@link https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_server_listen}
 */
Application.prototype.listen = function(...args) {
    var self = this
    var server = http.createServer(function(req, res) {
        // 异常/错误 处理函数done
        function done() {
            res.end('Cannot' + req.method + req.url)
        }
        self._router.handle(req, res, done)
    })
    server.listen(...args)
}

/**
 * This callback is displayed as part of the Application class.
 * http server 成功启动后的回调函数.
 *  **无参数**.
 * 
 * @callback Application~serverSuccessCallback
 */

/**
 * This callback is displayed as part of the Application class.
 * http server 客户端请求回调函数.
 * 
 * @callback Application~requestCallback
 * @param {Object}   req  request对象 Stream流
 * @param {Object}   res  response对象 Stream流
 *
 */

/**
 * Express http Server Constructor module
 * @module
 */
module.exports = Application
