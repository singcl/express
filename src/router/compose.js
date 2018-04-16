/**
 * @desc 客户端发起http请求后，通过该方法实现了两层Layer的遍历
 * @function
 * @name compose
 * @param {Object}  req     请求流
 * @param {Object}  res     响应流
 * @param {Object}  out     控制权转移
 */
var compose = function(req, res, out) {
    var index = 0
    var self = this
    function next(err) {
        if (err) return out(err)
        if (index >= self.stack.length) return out()
        var layer = self.stack[index++]
        if (layer.method === req.method.toLowerCase()) {
            layer.handleRequest(req, res, next)
        } else {
            next()
        }
    }
    next() 
}

/**
 * Express compose module
 * @module
 */
module.exports = compose
