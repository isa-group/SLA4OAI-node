/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');

/**
 * `ScopeResolver` constructor.
 *
 * @api public
 */
function ScopeResolver() {
}

var instance;

/**
 * Intialize the ScopeResolver.
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @return {ScopeResolver} for chaining
 * @api internal
 */
ScopeResolver.prototype.init = function (app, connection) {
  this._app = app;
  this._connection = connection;

  this._app.use("*", resolveScope);
  
  instance = this;
  return this;
};

/**
 * Configure the ScopeResolver.
 *
 * Examples:
 *
 *     slaManager.scopeResolver.configure(options);
 *
 * @param {Object} options
 * @return {ScopeResolver} for chaining
 * @api public
 */
ScopeResolver.prototype.configure = function (options) {
  options = options || {};
  this._oauthProvider = options.oauthProvider;
  return this;
};

/**
 * Middleware that set `agreement`, `scope`, and `reqestedPayload` in `req.sla` .
 */
function resolveScope(req, res, next) {
  if (req.query.apikey) {
    setAccountScope('apikey', req.query.apikey, req, next);
  }
  else {
    return next();
  }
}

function setAccountScope(paramName, paramValue, req, next) {
  getAccountScope(paramName, paramValue, function (err, result) {
    if (err) {
      return next(err);
    }
    console.log('>> result: ' + JSON.stringify(result));
    req.sla.agreement = result.sla;
    req.sla.scope = result.scope;
    req.sla.reqestedPayload = result.reqestedPayload;

    console.log('>> sla after scope: ' + JSON.stringify(req.sla));

    return next();
  });
}

function getAccountScope(paramName, paramValue, callback) {
  console.log('>> getting scope name: ' + paramName + ', value: ' + paramValue + ' , url: ' + instance._connection.url);

  var options = {
    method: 'GET',
    connection: instance._connection,
    path: '/tenants?' + paramName + '=' + paramValue
  };

  httpHelper.request(options, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
}

/**
 * Expose `ScopeResolver`.
 */
module.exports = ScopeResolver;
