// const express = require('../src/express')
// const app = express()
const Express = require('../src/application-hoc')
const app = new Express()

app.use('/example', function(req, res) {
    // 告诉客户端以UTF-8的方式解析
    // 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.write('来自星星的你', 'utf8')
    res.end(function() {
        console.log('数据已发送！')
    })
})

// 
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})