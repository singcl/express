// var express = require('../src/express')
// var app = express()
var error = require('../src/middleware/error')
var express = require('../src/express')
var app = express()

app.use('/xxx', function g(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    next('[全局]-中间件错误捕获：next(err)')
})

app.get('/example', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    next('[路由]-中间件错误捕获：next(err)')
})

app.get('/user', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.write('来自星星的你', 'utf8')
    res.end(function() {
        console.log('数据已发送！')
    })
})

app.post('/user', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.write('来自星星的POST', 'utf8')
    res.end(function() {
        console.log('post数据已发送！')
    })
})

// 错误中间件use - 自定义如何处理错误
app.use(error())

// 
app.listen(3001, function() {
    console.log('node server start at port 3000!')
})