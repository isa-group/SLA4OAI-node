/**
 * `Bouncer` constructor.
 *
 * @api public
 */
function Bouncer() {
}

/**
 * Intialize the Bouncer.
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @return {Bouncer} for chaining
 * @api internal
 */
Bouncer.prototype.init = function (app, connection) {
  this._app = app;
  this._connection = connection;
  return this;
};

/**
 * Expose `Bouncer`.
 */
module.exports = Bouncer;
