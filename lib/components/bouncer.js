/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');
var SlaError = require('../errors/slaerror');

/**
 * An instance of `Bouncer`
 */
var bouncer;

/**
 * `Bouncer` constructor.
 *
 * @api public
 */
function Bouncer() {
  bouncer = this;
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
  this._middleware = checkSla;
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
  this._environment = options.environment;
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
    connection: bouncer._connection,
    path: '/check',
    body: body
  };

  httpHelper.request(options, callback);
};

/**
 * Middleware that check the SLA.
 */
function checkSla(req, res, next) {
  if (bouncer.needChecking && !bouncer.needChecking(req)) {
    return next();
  }

  bouncer.check(buildSlaCheckRequestBody(req), function (err, result) {
    if (err) {
      return next(err);
    }

    if (result && result.accept === true) {
      return slaOk(req, next);
    }
    else {
      return slaFailed(req, res, next, result);
    }
  });
}

/**
 * Function that called if the SLA is accepted .
 *
 * @param {object} req
 * @param {function} next
 * @api private
 */
function slaOk(req, next) {
  return next();
}

/**
 * Function that called if the SLA is not accepted .
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {object} result
 * @api private
 */
function slaFailed(req, res, next, result) {
  if (bouncer.decline) {
    return bouncer.decline(req, res, next, result);
  }
  else {
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
  return {
    sla: req.sla.agreement,
    ts: req.sla.ts,
    resource: req.sla.resource,
    method: req.sla.method,
    environment: bouncer._environment,
    scope: req.sla.scope,
    requestedPayload: {}
  };
}

/**
 * Expose `Bouncer`.
 */
module.exports = Bouncer;
