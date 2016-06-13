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
 * Configure the Bouncer.
 *
 * Examples:
 *
 *     sla.bouncer.configure(options);
 *
 * @param {Object} options
 * @return {Bouncer} for chaining
 * @api public
 */
Bouncer.prototype.configure = function (options) {
  options = options || {};
  this._environment = options.environment;
  return this;
};

/**
 * Expose `Bouncer`.
 */
module.exports = Bouncer;
