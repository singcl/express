// 错误中间件 - 自定义如何处理错误
module.exports = function(callback) {
    return function(err, req, res, next) {
        if (typeof next !== 'function') {
            next = res
            res = req
            req = err
            err = null
        }

        if (!err) return next()
        if (typeof callback === 'function') {
            callback(err, req, res, next)
        } else {
            res.writeHead(500, {'Content-Type': 'text/plain;charset=utf-8'})
            res.write('[Error Middleware]:' + err)
            res.end(function() {
                console.log('[Error Middleware][default]: 错误【 ' + err + ' 】已经成功处理！' )
            })
        }
    }
}