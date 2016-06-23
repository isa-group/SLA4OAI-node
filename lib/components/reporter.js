/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');
var SlaError = require('../errors/slaerror');

/**
 * An instance of `Bouncer`
 */
var reporter;

/**
 * `Reporter` constructor.
 *
 * @api public
 */
function Reporter() {
  reporter = this;
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
  this._autoReport = true;
  this._aggregate = false;

  this._middleware = report;
  this._app.use("*", this._middleware);

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
  this._autoReport = options.autoReport || true;
  this._aggregate = options.aggregate || false;
  this._aggregationPeriod = options.aggregationPeriod;
  this._cluster = options.cluster;
  this._environment = options.environment;
  return this;
};

function report(req, res, next) {
  var requestedMetrics = getRequestedMetrics(req);
  if (needsMetrics(requestedMetrics)) {
    preCalculateMetrics(requestedMetrics, req, function (err) {
      if (err) {
        return next(new SlaError('preCalculateMetrics Error: ' + err, 500));
      }
      res.on("finish", function () {
        postCalculateMetrics(requestedMetrics, req, res, function (err, metrics) {
          if (err) {
            return next(new SlaError('postCalculateMetrics Error: ' + err, 500));
          }
          reportMetrics(metrics);
        });
      });
    });
  }
  next();
}

function getRequestedMetrics(req) {
  console.log('## getRequestedMetrics');
  if (req.sla && req.sla.requestedMetrics) {
    return req.sla.requestedMetrics;
  }
  return null;
}

function needsMetrics(metrics) {
  console.log('## needsMetrics');
  if (!metrics) {
    return false;
  }
  return true;
}

function preCalculateMetrics(requestedMetrics, req, cb) {
  console.log('## preCalculateMetrics');
  cb(null);
}

function postCalculateMetrics(requestedMetrics, req, res, cb) {
  console.log('## postCalculateMetrics');
  cb(null, 'metrics');
}

function reportMetrics(metrics) {
  console.log('## reportMetrics');
}

/**
 * Expose `Reporter`.
 */
module.exports = Reporter;
