/*!
 * @singcl/express
 * Copyright(c) 2018-2018 singcl
 * github: https://github.com/singcl/express
 * BSD-3 Licensed
 */

'use strict'

/**
 * Module dependencies
 * @private
 */
var http                =       require('http')
var methods             =       require('methods')
var debug               =       require('debug')('@singcl/express:application')
var finalhandler        =       require('finalhandler')
var flatten             =       require('array-flatten')
// var setPrototypeOf      =       require('setprototypeof')
// var compileETag         =       require('./utils').compileETag
// var compileQueryParser  =       require('./utils').compileQueryParser
// var compileTrust        =       require('./utils').compileTrust

var Router              =       require('./router')

/**
 * Application prototype
 * 
 * Nodejs DOC:
 * exports alias#
 * The exports variable that is available within a module starts as a reference
 * to module.exports. As with any variable, if you assign a new value to it, it
 * is no longer bound to the previous value.
 */
var app = exports = module.exports = {}

/**
 * Variable for trust proxy inheritance back-compat
 * @private
 */

// var trustProxyDefaultSymbol = '@@symbol:trust_proxy_default'

/**
 * Initialize the express server
 * - setup default configuration
 * - setup default middleware
 * - setup route reflection methods
 * 
 * @this {Object} express server instance
 * @private
 */
app.init = function init() {
    this.settings = {}
    this.defaultConfiguration()
}

/**
 * Initialize application configuration
 * @private
 */
app.defaultConfiguration = function defaultConfiguration() {
    // app.router is deprecated and removed.
    Object.defineProperty(this, 'router', {
        get: function() {
            throw new Error('\'app.router\' is deprecated!\nPlease see the 3.x to 4.x migration guide for details on how to update your app.')
        }
    })
}

/**
 * lazily adds the base router if it has not yet been added.
 *
 * We cannot add the base router in the defaultConfiguration because
 * it reads app settings which might be set after that has run.
 *
 * @private
 */
app.lazyRouter = function lazyRouter() {
    if (!this._router) {
        this._router = new Router(/*{
            caseSensitive: this.enabled('case sensitive routing'),
            strict: this.enabled('strict routing')
        }*/)

        // this._router.use(query(this.get('query parser fn')))
        // this._router.use(middleware.init(this))
    }
}

/**
 * Dispatch a req, res pair into the application. Starts pipeline processing.
 *
 * If no callback is provided, then default error handlers will respond
 * in the event of an error bubbling through the stack.
 *
 * @private
 */
app.handle = function handle(req, res, callback) {
    var router = this._router

    // final handler
    var done = callback || finalhandler(req, res, {
        // env: this.get('env'),
        onerror:logerror.bind(this)
    })

    // no routes
    if (!router) {
        debug('no routes defined on app')
        done()
        return
    }

    router.handle(req, res, done)
}

/**
 * Proxy `Router#use()` to add middleware to the app router.
 * See Router#use() documentation for details.
 *
 * If the _fn_ parameter is an express app, then it will be
 * mounted at the _route_ specified.
 *
 * @public
 */
app.use = function use(fn) {
    var offset = 0
    var path = '/'

    // default path to '/'
    // disambiguate app.use([fn])
    if (typeof fn !== 'function') {
        var arg = fn

        while(Array.isArray(arg) && arg.length !== 0) {
            arg = arg[0]
        }

        // first arg is the path
        if (typeof arg !== 'function') {
            offset = 1
            path = fn
        }
    }

    var fns = flatten(Array.prototype.slice.call(arguments, offset))
    if (fns.length === 0) {
        throw new TypeError('app.use() requires a middleware function')
    }

    // setup router
    this.lazyRouter()
    var router = this._router

    fns.forEach(function(fn) {
        // non-express app
        if (!fn || !fn.handle || !fn.set) {
            return router.use(path, fn)
        }

        // debug('.use app under %s', path)
        // fn.mountpath = path
        // fn.parent = this

        // // restore .app property on req and res
        // router.use(path, function mounted_app(req, res, next) {
        //     var orig = req.app
        //     fn.handle(req, res, function(err) {
        //         setPrototypeOf(req, orig.request)
        //         setPrototypeOf(res, orig.response)
        //         next(err)
        //     })
        // })

        // // mounted an app
        // fn.emit('mount', this)

    }, this)
}

/**
 * Proxy to the app `Router#route()`
 * Returns a new `Route` instance for the _path_.
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @public
 */

// app.route = function route(path) {
//     this.lazyRouter()
//     return this._router.route(path)
// }

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.set('foo', 'bar');
 *    app.set('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {*} [val]
 * @return {Server} for chaining
 * @public
 */

// app.set = function set(setting, val) {
//     if(arguments.length === 1) {
//         // app.get(setting)
//         return this.settings[setting]
//     }

//     debug('set "%s" to %o', setting, val)

//     this.settings[setting] = val

//     // trigger matched settings
//     switch (setting) {
//     case 'etag':
//         this.set('etag fn', compileETag(val))
//         break
//     case 'query parser':
//         this.set('query parser fn', compileQueryParser(val))
//         break
//     case 'trust proxy':
//         this.set('trust proxy fn', compileTrust(val))
//         // trust proxy inherit back-compat
//         Object.defineProperty(this.settings, trustProxyDefaultSymbol, {
//             configurable: true,
//             value: false
//         })
//         break
//     }

//     return this
// }

/**
 * Return the app's absolute pathname
 * based on the parent(s) that have
 * mounted it.
 *
 * For example if the application was
 * mounted as "/admin", which itself
 * was mounted as "/blog" then the
 * return value would be "/blog/admin".
 *
 * @return {String}
 * @private
 */

// app.path = function path() {
//     return this.parent
//         ? this.parent.path() + this.mountpath
//         : ''
// }

/**
 * Check if `setting` is enabled (truthy).
 *
 *    app.enabled('foo')
 *    // => false
 *
 *    app.enable('foo')
 *    app.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @public
 */

// app.enabled = function enabled(setting) {
//     return Boolean(this.set(setting))
// }

/**
 * Check if `setting` is disabled.
 *
 *    app.disabled('foo')
 *    // => true
 *
 *    app.enable('foo')
 *    app.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @public
 */

// app.disabled = function disabled(setting) {
//     return !this.set(setting)
// }

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @public
 */

// app.enable = function enable(setting) {
//     return this.set(setting, true)
// }

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @public
 */

// app.disable = function disable(setting) {
//     return this.set(setting, false)
// }

/**
 * Delegate `.VERB(...)` calls to `router.VERB(...)`.
 */

methods.forEach(function(method) {
    app[method] = function(path) {
        if (method === 'get' && arguments.length === 1) {
            // app.get(setting)
            return this.set(path)
        }

        this.lazyRouter()
        
        var route = this._router.route(path)
        route[method].apply(route, Array.prototype.slice.call(arguments, 1))
        return this
    }
})


/**
 * Listen for connections.
 *
 * A node `http.Server` is returned, with this
 * application (which is a `Function`) as its
 * callback. If you wish to create both an HTTP
 * and HTTPS server you may do so with the "http"
 * and "https" modules as shown here:
 *
 *    var http = require('http')
 *      , https = require('https')
 *      , express = require('express')
 *      , app = express();
 *
 *    http.createServer(app).listen(80);
 *    https.createServer({ ... }, app).listen(443);
 * 
 * @public
 * @returns {http.Server}
 */
app.listen = function listen() {
    var server = http.createServer(this)
    return server.listen.apply(server, arguments)
}


/**
 *  Log error using console.error.
 * 
 * @param {Error} err
 * @private
 */
function logerror(err) {
    /* istanbul ignore next */
    /* if (this.get('env') !== 'test') */ console.error(err.stack || err.toString())
}
