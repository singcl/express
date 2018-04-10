// const express = require('../src/express')
// const app = express()
const Express = require('../src/application-hoc')
const app = new Express()

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

// 
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})