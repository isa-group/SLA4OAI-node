/**
 * `Reporter` constructor.
 *
 * @api public
 */
function Reporter() {
}

/**
 * Intialize the Reporter.
 *
 * @param {Express} app
 * @param {Object} monitorConnection
 * @return {Reporter} for chaining
 * @api internal
 */
Reporter.prototype.init = function (app, connection) {
  this._app = app;
  this._connection = connection;
  return this;
};

/**
 * Expose `Reporter`.
 */
module.exports = Reporter;
