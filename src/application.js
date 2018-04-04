
const http = require('http')
const url = require('url')

// 自定义路由
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
 */
Application.prototype.listen = function(...args) {
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
    server.listen(...args)
}

/**
 * Express http Server Constructor module
 * @module
 */
module.exports = Application
