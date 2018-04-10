// 错误中间件 - 自定义如何处理错误
module.exports = function(callback) {
    return function(err, req, res, next) {
        // err存在时调用该中间件 - 处理错误逻辑: 这个时候4个参数
        if (next) {
            (typeof callback === 'function') && callback(err, req, res, next)
        } else {
            // err不存在时调用该中间件 - 比如客户端发起一个不存在的路径请求
            // 直接跳过该中间件
            res()
        }
    }
}