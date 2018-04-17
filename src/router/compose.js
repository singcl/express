/**
 * @desc 客户端发起http请求后，通过该方法实现了两层Layer的遍历
 * @function
 * @name compose
 * @param {Object}  req     请求流
 * @param {Object}  res     响应流
 * @param {Object}  out     控制权转移
 * @this route
 */
var compose = function(req, res, out) {
    var index = 0

    // this 指向route实例，compose.bind(route)
    var ctx = this
    /**
     * next 函数递归调用
     * 每调用一次next route stack 栈中的 layer 就出栈一个
     * @param {*} err next [路由中间件]函数抛出的错误信息
     */
    function next(err) {
        // 如果路由中间件中next('err')信息
        // 则直接跳出当前路由(route 堆栈中的其他路由中间件layer 都跳过)
        // 直接到router 堆栈中的下layer
        if (err) return out(err)

        // 如果route 堆栈中的路由中间件layer 遍历完了还没找到对应的处理layer
        // 则直接到router 堆栈中的下layer
        if (index >= ctx.stack.length) return out()
        // 后置++ index++ 的值从0开始
        var layer = ctx.stack[index++]
        if (layer.method === req.method.toLowerCase()) {
            // 执行路由中间件layer层 并且传出next 函数本身
            layer.handleRequest(req, res, next)
        } else {
            // 则直接入栈下一个路由中间件layer的执行上下文
            next()
        }
    }
    // 启动next 第一个路由中间件layer入栈
    next()
}

/**
 * Express compose module
 * @module
 */
module.exports = compose
