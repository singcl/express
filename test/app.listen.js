var express = require('../')

/* global describe it */

// app.listen test
describe('app.listen()', function() {
    it('should wrap with an HTTP server', function(done) {

        var app = express()

        app.get('/noob', function(req, res){
            res.end('get noob!')
        })

        var server = app.listen(9999, function() {
            server.close()
            done()
        })
    })
})