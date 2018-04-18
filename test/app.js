'use strict'

var assert = require('assert')
var express = require('..')
var request = require('supertest')

/* global describe it  */
describe('app', function() {
    // 测试@singcl/express 是否继承了Event Emitter
    it('should inherit from event emitter', function(done) {
        var app = express()
        app.on('foo', done)
        app.emit('foo')
    })

    // callable
    it('should be callable', function() {
        var app = express()
        assert.equal(typeof app, 'function')
    })

    // 404
    // it('should 404 without routes', function(done) {
    //     request(express())
    //         .get('/')
    //         .expect(404, done)
    // })
})