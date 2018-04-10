![Express@singcl](./src/img/express.jpg)
## 🐠 Express
[![npm (scoped)](https://img.shields.io/npm/v/@singcl/express.svg?style=flat-square)](https://www.npmjs.com/package/@singcl/promise)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-10de6e.svg?style=flat-square)](https://github.com/prettier/prettier)
![David](https://img.shields.io/david/dev/singcl/express.svg?style=flat-square)
![David](https://img.shields.io/david/singcl/express.svg?style=flat-square)

A counterfeit Express.

*badge: https://img.shields.io/*


### Usage
`npm i @singcl/express -S`

### example
```js
var error = require('@singcl/express-error')
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
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})
```