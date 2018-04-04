
const http = require('http')
const url = require('url')

/**
 * @description 自定义路由
 * @namespace  router
 */
const router = [{
    path: '*',
    method: '*',
    handler: function(req, res) {
        res.end(`Can not ${req.method}-${req.url}`)
    }
}]

/**
 * @description Express Application 构造函数
 * @constructor
 * @public
 */
function Application() {
    //
}

/**
 * @desc 原型方法 listen 对node http 相关方法的封装，启动一个http 服务
 * @name Application#listen
 * @function
 * @param {Number}  port Express 服务器启动的端口
 * @param {Application~serverSuccessCallback} cb - http server 成功启动后的回调函数
 * @see https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_server_listen
 */
Application.prototype.listen = function(port, cb) {
    const self = this
    const server = http.createServer(function(req, res) {
        let { pathname } = url.parse(req.url, true)
        for (let i = 1; i < router.length; i++) {
            let { path, method, handler } = router[i]
            if (pathname === path && req.method.toLocaleLowerCase === method) {
                return handler(req, res)
            }
        }
        router[0].handler(req, res)
    })
    server.listen(port, cb)
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
