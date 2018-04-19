'use strict'

/**
 * Module dependencies.
 * @api private
 */

var Buffer          =       require('safe-buffer').Buffer
var etag            =       require('etag')
var querystring     =       require('querystring')
var qs              =       require('qs')
var proxyaddr       =       require('proxy-addr')

/**
 * Return strong ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */
exports.etag = createETagGenerator({ weak: false })

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */
exports.wetag = createETagGenerator({ weak: true })


/**
 * Compile "etag" value to function.
 *
 * @param  {Boolean|String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileETag = function(val) {
    var fn
  
    if (typeof val === 'function') {
        return val
    }
  
    switch (val) {
    case true:
        fn = exports.wetag
        break
    case false:
        break
    case 'strong':
        fn = exports.etag
        break
    case 'weak':
        fn = exports.wetag
        break
    default:
        throw new TypeError('unknown value for etag function: ' + val)
    }
  
    return fn
}

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Function} val
 * @return {Function}
 * @api private
 */
exports.compileQueryParser = function compileQueryParser(val) {
    var fn
  
    if (typeof val === 'function') {
        return val
    }
  
    switch (val) {
    case true:
        fn = querystring.parse
        break
    case false:
        fn = newObject
        break
    case 'extended':
        fn = parseExtendedQueryString
        break
    case 'simple':
        fn = querystring.parse
        break
    default:
        throw new TypeError('unknown value for query parser function: ' + val)
    }
  
    return fn
}

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} val
 * @return {Function}
 * @api private
 */

exports.compileTrust = function(val) {
    if (typeof val === 'function') return val
  
    if (val === true) {
        // Support plain true/false
        return function(){ return true }
    }
  
    if (typeof val === 'number') {
        // Support trusting hop count
        return function(a, i){ return i < val }
    }
  
    if (typeof val === 'string') {
        // Support comma-separated values
        val = val.split(/ *, */)
    }
  
    return proxyaddr.compile(val || [])
}


/**
 * Create an ETag generator function, generating ETags with
 * the given options.
 *
 * @param {object} options
 * @return {function}
 * @private
 */
function createETagGenerator(options) {
    return function generateETag(body, encoding) {
        var buffer = !Buffer.isBuffer(body)
            ? Buffer.from(body, encoding)
            : body
        return etag(buffer, options)
    }
}

/**
 * Return new empty object.
 *
 * @return {Object}
 * @api private
 */

function newObject() {
    return {}
}

/**
 * Parse an extended query string with qs.
 *
 * @return {Object}
 * @private
 */

function parseExtendedQueryString(str) {
    return qs.parse(str, {
        allowPrototypes: true
    })
}
