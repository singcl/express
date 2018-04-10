// const express = require('../src/express')
// const app = express()
const Express = require('../src/application-hoc')
const app = new Express()

app.use('/example', function(req, res, next) {
    res.write('sjflsjfsdlfjsdlfjs')
    res.end(function() {
        console.log('数据已发送！')
    })
})
// 
app.listen(3000, function() {
    console.log('node server start at port 3000!')
})