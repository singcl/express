/*!
 * @singcl/express
 * Copyright(c) 2018-2018 singcl
 * github: https://github.com/singcl/express
 * BSD-3 Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */
var Route               =       require('./route')
var Layer               =       require('./layer')
// var methods = require('methods')
var setPrototypeOf      =       require('setprototypeof')
// var mixin = require('utils-merge')
var debug               =       require('debug')('express:router')
var parseUrl            =       require('parseurl')
var flatten             =       require('array-flatten')

/**
 * Module variables.
 * @private
 */
var objectRegExp = /^\[object (\S+)\]$/
var slice = Array.prototype.slice
var toString = Object.prototype.toString

/**
 * Initialize a new `Router` with the given `options`.
 *
 * @param {Object} options
 * @return {Router} which is an callable function
 * @public
 */
var proto = module.exports = function(options) {
    var opts = options || {}

    function router(req, res, next) {
        router.handle(req, res, next)
    }

    // mixin Router class functions
    setPrototypeOf(router, proto)

    router.params = {}
    router._params = []
    router.caseSensitive = opts.caseSensitive
    router.mergeParams = opts.mergeParams
    router.strict = opts.strict
    router.stack = []

    return router
}

/**
 * Create a new Route for the given path.
 *
 * Each route contains a separate middleware stack and VERB handlers.
 *
 * See the Route api documentation for details on adding handlers
 * and middleware to routes.
 *
 * @param {String} path
 * @return {Route}
 * @public
 */
proto.route = function route(path) {
    var route = new Route(path)

    var layer = new Layer(path, {
        sensitive: this.caseSensitive,
        strict: this.strict,
        end: true
    }, route.dispatch.bind(route))

    layer.route = route

    this.stack.push(layer)
    return route
}

/**
 * Dispatch a req, res into the router.
 * @private
 */
proto.handle = function handle(req, res, out) {
    var self = this

    debug('dispatching %s %s', req.method, req.url)

    var idx = 0
    var protohost = getProtoHost(req.url) || ''
    var removed = ''
    var slashAdded = false
    var paramcalled = {} 

    // middleware and routes
    var stack = self.stack

    // manage inter-router variables
    var parentUrl = req.baseUrl || ''
    var done = restore(out, req, 'baseUrl', 'next', 'params')

    // setup next layer
    req.next = next

    req.originalUrl = req.originalUrl || req.url

    next()

    function next(err) {
        var layerError = err === 'route'
            ? null
            : err
        
        // remove added slash
        if (slashAdded) {
            req.url = req.url.substr(1)
            slashAdded = false
        }

        // restore altered req.url
        if (removed.length !== 0) {
            //
        }

        // signal to exit router
        if (layerError === 'router') {
            setImmediate(done, null)
            return
        }

        // no more matching layers
        if (idx > stack.length) {
            setImmediate(done, layerError)
            return
        }

        // get pathname of request
        var path = getPathname(req)

        if (path == null) {
            return done(layerError)
        }

        // find next matching layer
        var layer
        var match
        var route

        while(match !== true && idx < stack.length) {
            layer = stack[idx++]
            match = matchLayer(layer, path)
            route = layer.route

            if (typeof match !== 'boolean') {
                // hold on to layerError
                layerError = layerError || match
            }

            if (match !== true) {
                continue
            }

            if(!route) {
                // process non-route handlers normally
                continue
            }

            if (layerError) {
                // routes do not match with a pending error
                match = false
                continue
            }

            var method = req.method
            var has_method = route._handles_method(method)

            // don't even bother matching route
            if (!has_method && method !== 'HEAD') {
                match = false
                continue
            }
        }

        // no match
        if (match !== true) {
            return done(layerError)
        }

        // store route for dispatch on change
        if (route) {
            req.route = route
        }

        // Capture one-time layer values
        req.params = layer.params
        
        var layerPath = layer.path

        // this should be done for the layer
        self.process_params(layer, paramcalled, req, res, function(err) {
            if (err) {
                return next(layerError || err)
            }

            if (route) {
                return layer.handle_request(req, res, next)
            }

            trim_prefix(layer, layerError, layerPath, path)
        })
    }

    function trim_prefix(layer, layerError, layerPath, path) {
        if (layerPath.length !== 0) {
            // Validate path breaks on a path separator
            var c = path[layerPath.length]
            if (c && c !== '/' && c !== '.') return next(layerError)

            // Trim off the part of the url that matches the route
            // middleware (.use stuff) needs to have the path stripped
            debug('trim prefix (%s) from url %s', layerPath, req.url)
            removed = layerPath
            req.url = protohost + req.url.substr(protohost.length + removed.length)

            // Ensure leading slash
            if (!protohost && req.url[0] !== '/') {
                req.url = '/' + req.url
                slashAdded = true
            }

            // Setup base URL (no trailing slash)
            req.baseUrl = parentUrl + (removed[removed.length - 1] === '/'
                ? removed.substring(0, removed.length - 1)
                : removed)
        }
        
        debug('%s %s : %s', layer.name, layerPath, req.originalUrl)

        if (layerError) {
            layer.handle_error(layerError, req, res, next)
        } else {
            layer.handle_request(req, res, next)
        }
    }
}

/**
 * Process any parameters for the layer.
 * @private
 */
proto.process_params = function process_params(layer, called, req, res, done) {
    // var params = this.params

    // captured parameters from the layer, keys and values
    var keys = layer.keys

    // fast track
    if (!keys || keys.length === 0) {
        return done()
    }
}

proto.use = function use(fn) {
    var offset = 0
    var path = '/'

    // default path to '/'
    // disambiguate router.use([fn])
    if (typeof fn !== 'function') {
        var arg = fn

        while (Array.isArray(arg) && arg.length !== 0) {
            arg = arg[0]
        }

        // first arg is the path
        if (typeof arg !== 'function') {
            offset = 1
            path = fn
        }
    }

    var callbacks = flatten(slice.call(arguments, offset))

    if (callbacks.length === 0) {
        throw new TypeError('Router.use() requires a middleware function')
    }

    for(var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i]

        if (typeof callback !== 'function') {
            throw new TypeError('Router.use() requires a middleware function but got a ' + gettype(callback))
        }

        // add the middleware
        debug('use %o %s', path, callback.name || '<anonymous>')

        var layer = new Layer(path, {
            // sensitive: this.caseSensitive,
            // strict: false,
            end: false
        }, callback)

        layer.route = undefined

        this.stack.push(layer)
    }

    return this
}

// Get get protocol + host for a URL
function getProtoHost(url) {
    if (typeof url !== 'string' || url.length === 0 || url[0] === '/') {
        return undefined
    }

    var searchIndex = url.indexOf('?')
    var pathLength = searchIndex !== -1
        ? searchIndex
        : url.length
    
    var fqdnIndex = url.substr(0, pathLength).indexOf('://')

    return fqdnIndex !== -1
        ? url.substr(0, url.indexOf('/', 3 + fqdnIndex))
        : undefined
}

// restore obj props after function
function restore(fn, obj) {
    var props = new Array(arguments.length - 2)
    var vals = new Array(arguments.length - 2)

    for(var i = 0; i < props.length; i++) {
        props[i] = arguments[i + 2]
        vals[i] = obj[props[i]]
    }

    return function() {
        // restore vals
        for(var i = 0; i < props.length; i++) {
            obj[props[i]] = vals[i]
        }
        return fn.apply(this, arguments)
    }
}

// get pathname of request
function getPathname(req) {
    try {
        return parseUrl(req).pathname
    } catch (err) {
        return undefined
    }
}

/**
 * Match path to a layer.
 *
 * @param {Layer} layer
 * @param {string} path
 * @private
 */
function matchLayer(layer, path) {
    try {
        return layer.match(path)
    } catch (err) {
        return err
    }
}

// get type for error message
function gettype(obj) {
    var type = typeof obj
  
    if (type !== 'object') {
        return type
    }
  
    // inspect [[Class]] for objects
    return toString.call(obj)
        .replace(objectRegExp, '$1')
}