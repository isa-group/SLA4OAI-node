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
 * Configure the Reporter.
 *
 * Examples:
 *
 *     slaManager.reporter.configure(options);
 *
 * @param {Object} options
 * @return {Reporter} for chaining
 * @api public
 */
Reporter.prototype.configure = function (options) {
  options = options || {};
  this._autoReport = options.autoReport;
  this._aggregate = options.aggregate;
  this._aggregationPeriod = options.aggregationPeriod;
  this._autoPopulatedMetrics = options.autoPopulatedMetrics;
  this._cluster = options.cluster;
  this._environment = options.environment;
  return this;
};

/**
 * Expose `Reporter`.
 */
module.exports = Reporter;
