/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');
var SlaError = require('../errors/slaerror');

/**
 * An instance of `Bouncer`
 */
//var bouncer;

/**
 * `Bouncer` constructor.
 *
 * @api public
 */
function Bouncer() {
    //bouncer = this;
    this._middleware = checkSla;
    this._notCheckByDefault = true;
}

/**
 * Intialize the Bouncer.
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @return {Bouncer} for chaining
 * @api public
 */
Bouncer.prototype.init = function (app, connection) {
    this._app = app;
    this._connection = connection;
    this._app.use("*", this._middleware);
    return this;
};

/**
 * Configure the Bouncer.
 *
 * Examples:
 *
 *     slaManager.bouncer.configure(options);
 *
 * @param {Object} options
 * @return {Bouncer} for chaining
 * @api public
 */
Bouncer.prototype.configure = function (options) {
    options = options || {};

    for (var o in options) {
        this["_" + o] = options[o];
    }

    return this;
};

/**
 * Check the SLA with `/check' api.
 *
 * @param {Object} body
 * @param {function} callback
 * @api public
 */
Bouncer.prototype.check = function (body, callback) {
    var options = {
        method: 'POST',
        connection: this._connection,
        path: '/check',
        body: body
    };

    httpHelper.request(options, callback);
};

/**
 *  by defaul Not check
 */
function notChecking(req) {
    var endpoints = ["/docs", "api-docs"];
    var ret = false;

    for (var e in endpoints) {
        if (req.originalUrl) {
            if (req.originalUrl.indexOf(endpoints[e]) !== -1) ret = ret || true;
        } else {
            if (req.url.indexOf(endpoints[e]) !== -1) ret = ret || true;
        }
    }

    return ret;
}

/**
 * Middleware that check the SLA.
 */
function checkSla(req, res, next) {
    var bouncer = req.slaManager.bouncer;

    if ((bouncer.needChecking && !bouncer.needChecking(req)) || (bouncer._notCheckByDefault && notChecking(req))) {
        return next();
    }

    bouncer.check(buildSlaCheckRequestBody(req), function (err, result) {
        if (err) {
            return next(err);
        }

        if (result && result.accept === true) {
            return slaOk(req, result, next);
        } else {
            return slaFailed(req, res, result, next);
        }
    });
}

/**
 * Called if the SLA is accepted .
 *
 * @param {object} req
 * @param {function} next
 * @api private
 */
function slaOk(req, result, next) {
    req.sla.quotas = result.quotas;
    req.sla.rates = result.rates;
    req.sla.configuration = result.configuration;
    req.sla.requestedMetrics = result.requestedMetrics || [];
    return next();
}

/**
 * Called if the SLA is not accepted .
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {object} result
 * @api private
 */
function slaFailed(req, res, result, next) {
    var bouncer = req.slaManager.bouncer;

    if (bouncer.decline) {
        return bouncer.decline(req, res, next, result);
    } else {
        return next(new SlaError(result, 403));
    }
}

/**
 * Build the check api request body.
 *
 * @param {object} req
 * @return {object} for body
 * @api private
 */
function buildSlaCheckRequestBody(req) {
    var bouncer = req.slaManager.bouncer;

    req.sla.metrics = bouncer.resolveMetrics ? bouncer.resolveMetrics(req.sla.requestedMetrics, req) : {};
    return {
        sla: req.sla.agreement,
        ts: req.sla.ts,
        resource: req.sla.resource,
        method: req.sla.method,
        environment: bouncer._environment,
        scope: req.sla.scope,
        metrics: req.sla.metrics
    };
}

/**
 * Expose `Bouncer`.
 */
module.exports = Bouncer;
