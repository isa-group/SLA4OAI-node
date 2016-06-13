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
  return this;
};

/**
 * Expose `ScopeResolver`.
 */
module.exports = ScopeResolver;
