/**
 * `ScopeResolver` constructor.
 *
 * @api public
 */
function ScopeResolver() {
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

function resolveScope(req, res, next) {
  if (req.query.apikey) {
    setAccountScope('apikey', req.query.apikey, req, next);
  }
  else {
    return next();
  }
}

function setAccountScope(paramName, paramValue, req, next) {
  getAccountScope(paramName, paramValue, function (err, scope) {
    if (err) {
      return next(err);
    }

    req.sla.scope = scope;
    return next();
  });
}

function getAccountScope(paramName, paramValue, callback) {
  console.log('>> get scope name: ' + paramName + ', value: ' + paramValue);
  callback(null, {});
}

/**
 * Expose `ScopeResolver`.
 */
module.exports = ScopeResolver;
