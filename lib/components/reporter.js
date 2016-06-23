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
  if (needsMetrics(req)) {
    preCalculateMetrics(req, function () {
      res.on("finish", function () {
        postCalculateMetrics(req, res, function () {
          reportMetrics(req.sla.metrics);
        });
      });
    });
  }
  next();
}

function needsMetrics(req) {
  return req.sla.requestedMetrics && req.sla.requestedMetrics.length > 0;
}

function preCalculateMetrics(req, callback) {
  req.sla.startTime = Date.now();

  if (isRequested(req, 'requestHeaders')) {
    req.sla.metrics.requestHeaders = req.headers;
  }

  if (isRequested(req, 'userAgent')) {
    req.sla.metrics.userAgent = req.headers["user-agent"];
  }

  callback();
}

function postCalculateMetrics(req, res, callback) {
  if (isRequested(req, 'requestBody')) {
    req.sla.metrics.requestBody = req.body;
  }
  if (isRequested(req, 'responseHeaders')) {
    req.sla.metrics.responseHeaders = res._headers;
  }
  if (isRequested(req, 'responseBody')) {
    req.sla.metrics.responseBody = res.body;
  }
  if (isRequested(req, 'responseTime')) {
    req.sla.metrics.responseTime = Date.now() - req.sla.startTime;
  }

  callback();
}

function reportMetrics(metrics) {
  console.log('##');
  console.log('## reportMetrics: ' + JSON.stringify(metrics));
  console.log('##');
}

function isRequested(req, metric) {
  return (req.sla.requestedMetrics.indexOf(metric) > -1);
}

/**
 * Expose `Reporter`.
 */
module.exports = Reporter;
