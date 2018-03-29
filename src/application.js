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

// Application 构造函数
function Application() {
    //
}

// 类的原型方法listen
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

//
module.exports = Application
