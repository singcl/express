var http = require('http')
var Router = require('./router')
var methods = require('methods')

/**
 * @description Express Application 构造函数
 * @constructor
 * @public
 */
function Application() {
    //
}

/**
 * @desc express 实例上如果没有router实例，增加router实例
 * @function Application#lazyRouter
 */
Application.prototype.lazyRouter = function() {
    if (!this._router) this._router = new Router()
}

/**
 * @desc express 实例上增加路由方法
 * 实际是调用router实例上的方法
 */
methods.forEach(function(method) {
    Application.prototype[method] = function() {
        this.lazyRouter()
        this._router[method].apply(this._router, arguments)
        return this
    }
})

/**
 * @desc 添加中间件，而中间件和普通的路由都是放在一个栈中的，放在this._router.stack
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
Application.prototype.listen = function() {
    // 确保原型方法都没有调用的时候this._router存在
    this.lazyRouter()

    var self = this
    var server = http.createServer(function(req, res) {
        // 异常/错误 处理函数done
        function done(err) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain;charset=utf-8'})
                res.write('errorMsg:' + err, 'utf8')
                res.end(function() {
                    console.log('默认错误处理函数[done(err)] - 错误以处理！')
                })
            } else {
                res.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'})
                res.write('Cannot 【' + req.method + '】【' + req.url + '】')
                res.end(function() {
                    console.log('默认错误处理函数[done()] - 错误以处理！')
                })
            }
        }
        self._router.handle(req, res, done)
    })

    // 调用http server 的listen 方法
    server.listen.apply(server, arguments)
}

/**
 * This callback is displayed as part of the Application class.
 * http server 成功启动后的回调函数.
 *  **无参数**.
 * 
 * @callback Application~serverSuccessCallback
 */

/**
 * Express http Server Constructor module
 * @module
 */
module.exports = Application
