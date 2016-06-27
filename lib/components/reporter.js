/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');

/**
 * An instance of `Reporter`
 */
var reporter;

/**
 * `Reporter` constructor.
 *
 * @api public
 */
function Reporter() {
  reporter = this;
  this._autoReport = true;
  this._aggregate = false;
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

  this._middleware = reportSla;
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
  this._autoReport = options.autoReport;
  this._aggregate = options.aggregate;
  this._aggregationPeriod = options.aggregationPeriod;
  this._cluster = options.cluster;
  this._environment = options.environment;
  return this;
};

/**
 * Report the metrics to `/metrics' api.
 *
 * @param {Object} body
 * @param {function} callback
 * @api public
 */
Reporter.prototype.report = function (body, callback) {
  var options = {
    method: 'POST',
    connection: reporter._connection,
    path: '/metrics',
    body: body
  };

  httpHelper.request(options, callback);
};

/**
 * Manually report the metrics to `/metrics' api.
 *
 * @api public
 */
Reporter.prototype.reportMetrics = function () {
  if (this._autoReport) {
    throw new Error('Can not manually report metrics, because "_autoReport" flag is true.');
  }
  if (this.pendingMetrics) {
    var body = this.pendingMetrics;
    this.pendingMetrics = null;
    this.report(body, function (err, result) {
      if (err) {
        console.error("Error while sending metrics: " + err.message);
      }
    });
  }
};

function reportSla(req, res, next) {
  if (needsMetrics(req)) {
    preCalculateMetrics(req, function () {
      res.on("finish", function () {
        postCalculateMetrics(req, res, function () {
          reportMetrics(req, res);
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

function reportMetrics(req, res) {
  if (reporter._autoReport) {
    var body = buildReportBody(req, res);
    body.measures.push(buildMeasure(req, res));
    reporter.report(body, function (err, result) {
      if (err) {
        console.error("Error while sending metrics: " + err.message);
      }
    });
  }
  else {
    if (!reporter.pendingMetrics) {
      reporter.pendingMetrics = buildReportBody(req, res);
    }

    reporter.pendingMetrics.measures.push(buildMeasure(req, res));
  }
}

function isRequested(req, metric) {
  return (req.sla.requestedMetrics.indexOf(metric) > -1);
}

function buildReportBody(req, res) {
  return {
    sla: req.sla.agreement,
    scope: req.sla.scope,
    sender: {
      host: req.hostname,
      environment: reporter._environment,
      cluster: reporter._cluster
    },
    measures: []
  };
}

function buildMeasure(req, res) {
  return {
    resource: req.sla.resource,
    method: req.sla.method,
    result: res.statusCode,
    ts: req.sla.ts,
    metrics: req.sla.metrics
  };
}

/**
 * Expose `Reporter`.
 */
module.exports = Reporter;
