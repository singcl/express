var assert = require('assert')

// Mocha 测试用例写法示例
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1)
        })
    })
})
