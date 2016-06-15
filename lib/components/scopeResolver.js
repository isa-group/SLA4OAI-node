/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');

/**
 * An instance of `ScopeResolver`
 */
var scopeResolver;

/**
 * `ScopeResolver` constructor.
 *
 * @api public
 */
function ScopeResolver() {
  scopeResolver = this;
}

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
 * Middleware that resolve the scope components from the tenants api.
 */
function resolveScope(req, res, next) {
  if (req.query.apikey) {
    setAccountScope('apikey', req.query.apikey, req, next);
  }
  else {
    return next();
  }
}

/**
 * Function that set `agreement`, `scope`, and `reqestedPayload` in `req.sla` .
 *
 * @param {string} paramName
 * @param {string} paramValue
 * @param {object} req
 * @param {function} next
 * @api private
 */
function setAccountScope(paramName, paramValue, req, next) {
  getAccountScope(paramName, paramValue, function (err, result) {
    if (err) {
      return next(err);
    }

    req.sla.agreement = result.sla;
    req.sla.scope = result.scope;
    req.sla.reqestedPayload = result.reqestedPayload;

    return next();
  });
}

/**
 * Retrive the scope components from the tenants api
 *
 * @param {string} paramName
 * @param {string} paramValue
 * @param {function} callback
 * @api private
 */
function getAccountScope(paramName, paramValue, callback) {
  var options = {
    method: 'GET',
    connection: scopeResolver._connection,
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
