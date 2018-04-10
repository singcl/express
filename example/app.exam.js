// var express = require('../src/express')
// var app = express()
var error = require('../src/middleware/error')
var Express = require('../src/application')
var app = new Express()

app.get('/example', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析
    // 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    next('路由中间件错误捕获：next(err)')
    // res.write('来自星星的你', 'utf8')
    // res.end(function() {
    //     console.log('数据已发送！')
    // })
})

app.get('/user', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析
    // 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.write('来自星星的你', 'utf8')
    res.end(function() {
        console.log('数据已发送！')
    })
})

// 错误中间件use - 自定义如何处理错误
app.use(error(function(err, req, res, next) {
    console.log(err)
    res.end(err)
}))

// 
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})