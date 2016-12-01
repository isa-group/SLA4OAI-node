/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');

/**
 * An instance of `Reporter`
 */
//var reporter;

/**
 * `Reporter` constructor.
 *
 * @api public
 */
function Reporter() {
    //reporter = this;
    this._autoReport = true;
    this._aggregate = false;
    this._middleware = reportSla;
}

/**
 * Intialize the Reporter.
 *
 * @param {Express} app
 * @param {Object} monitorConnection
 * @return {Reporter} for chaining
 * @api public
 */
Reporter.prototype.init = function (app, connection) {
    this._app = app;
    this._connection = connection;
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

    for (var o in options) {
        this["_" + o] = options[o];
    }

    return this;
};

/**
 * An extenstion that allow users to set custom metrics.
 *
 * Examples:
 *
 *     slaManager.reporter.setMetric(req, "animalTypes", pets.length);
 *
 * @param {Object} req
 * @param {string} name
 * @param {object} value
 * @api public
 */
Reporter.prototype.setMetric = function (req, name, value) {
    req.sla.metrics[name] = value;
};

/**
 * Manually report all pending metrics to `/metrics' api.
 *
 * Examples:
 *
 *     slaManager.reporter.reportMetrics();
 *
 * @api public
 */
Reporter.prototype.reportMetrics = function (req) {
    var reporter = req.slaManager.reporter;
    reporter.timerPending = false;
    if (reporter.pendingMetrics) {
        var body = reporter.pendingMetrics;
        reporter.pendingMetrics = null;
        reporter.report(body, function (err, result) {
            if (err) {
                console.error("Error while sending metrics: " + err.message);
            }
        });
    }
};

/**
 * Report the metrics to `/metrics' api.
 *
 * @param {Object} body
 * @param {function} callback
 * @api public
 */
Reporter.prototype.report = function (body, callback, req) {
    var reporter = req.slaManager.reporter;
    var options = {
        method: 'POST',
        connection: reporter._connection,
        path: '/metrics',
        body: body
    };

    httpHelper.request(options, callback);
};

/**
 * Middleware that report the SLA.
 */
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

/**
 * Determine if there are requested metrics or not.
 *
 * @param {Object} req
 * @return {Boolean} for result
 * @api private
 */
function needsMetrics(req) {
    return req.sla.requestedMetrics && req.sla.requestedMetrics.length > 0;
}

/**
 * Collect some metrics before the API logic.
 *
 * @param {Object} req
 * @param {function} callback
 * @api private
 */
function preCalculateMetrics(req, callback) {
    var reporter = req.slaManager.reporter;
    req.sla.startTime = Date.now();

    if (isRequested(req, 'requestHeaders')) {
        req.sla.metrics.requestHeaders = req.headers;
    }

    if (isRequested(req, 'userAgent')) {
        req.sla.metrics.userAgent = req.headers["user-agent"];
    }

    if (reporter.preCalculateMetrics) {
        reporter.preCalculateMetrics(req.sla.requestedMetrics, req, callback);
    } else {
        callback();
    }
}

/**
 * Collect some metrics after the API logic.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {function} callback
 * @api private
 */
function postCalculateMetrics(req, res, callback) {
    var reporter = req.slaManager.reporter;
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

    if (reporter.postCalculateMetrics) {
        reporter.postCalculateMetrics(req.sla.requestedMetrics, req, res, callback);
    } else {
        callback();
    }
}

/**
 * Determine the appropriate behaviour based on the configuration (direct send or add to the pending list).
 *
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
function reportMetrics(req, res) {
    var reporter = req.slaManager.reporter;
    if (reporter._autoReport) {
        if (reporter._aggregate) {
            if (!reporter.pendingMetrics) {
                reporter.pendingMetrics = buildReportBody(req, res);
            }
            reporter.pendingMetrics.measures.push(buildMeasure(req, res));

            if (!reporter.timerPending) {
                reporter.timerPending = true;
                setTimeout(() => {
                    reporter.reportMetrics(req);
                }, reporter._aggregationPeriod);
            }
        } else {
            var body = buildReportBody(req, res);
            body.measures.push(buildMeasure(req, res));
            reporter.report(body, function (err, result) {
                if (err) {
                    console.error("Error while sending metrics: " + err.message);
                }
            }, req);
        }
    } else {
        if (!reporter.pendingMetrics) {
            reporter.pendingMetrics = buildReportBody(req, res);
        }
        reporter.pendingMetrics.measures.push(buildMeasure(req, res));
    }
}

/**
 * Check if this metric is requested.
 *
 * @param {Object} req
 * @param {string} metric
 * @api private
 */
function isRequested(req, metric) {
    return (req.sla.requestedMetrics.indexOf(metric) > -1);
}

/**
 * Build the body of the monitor request.
 *
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
function buildReportBody(req, res) {
    var reporter = req.slaManager.reporter;
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

/**
 * Build the measure of the current request.
 *
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
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
