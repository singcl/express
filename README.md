![Express@singcl](./src/img/express.jpg)
## 🐠 Express
A counterfeit Express.

### Usage
`npm i @singcl/express`

### example
```js
var express = require('@singcl/express')
var app = express()

app.get('/example', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    next('路由中间件错误捕获：next(err)')
})

app.get('/user', function(req, res, next) {
    // 告诉客户端以UTF-8的方式解析 设置charset=utf-8解决前端拿到的数据中文乱码
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.write('来自星星的你', 'utf8')
    res.end(function() {
        console.log('数据已发送！')
    })
})

// 错误中间件use - 自定义如何处理错误
app.use(function(err, req, res, next) {
    // err存在时调用该中间件 - 处理错误逻辑: 这个时候4个参数
    if (next) {
        console.log(err)
        res.end(err)
    } else {
        // err不存在时调用该中间件 - 比如客户端发起一个不存在的路径请求
        // 直接跳过该中间件
        res()
    }
})

//
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})
```