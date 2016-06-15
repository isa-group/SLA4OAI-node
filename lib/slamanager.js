/**
 * Module dependencies.
 */
var ScopeResolver = require('./components/scopeResolver');
var Bouncer = require('./components/bouncer');
var Reporter = require('./components/reporter');

/**
 * `SlaManager` constructor.
 *
 * @api public
 */
function SlaManager() {
}

/**
 * Instantiate the components
 */
var scopeResolver = new ScopeResolver();
var bouncer = new Bouncer();
var reporter = new Reporter();

/**
 * Expose the components
 */
SlaManager.prototype.scopeResolver = scopeResolver;
SlaManager.prototype.bouncer = bouncer;
SlaManager.prototype.reporter = reporter;

/**
 * Register all library components as express middlewares.
 * Called once when the server getting up.
 *
 * Examples:
 *
 *     Slamanager.register(app, supervisorConnection, monitorConnection);
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @param {Object} monitorConnection
 * @return {SlaManager} for chaining
 * @api public
 */
SlaManager.prototype.register = function (app, supervisorConnection, monitorConnection) {
    if (!app) {
        throw new Error('Missing parameter: app (Express)');
    }
    if (!supervisorConnection) {
        throw new Error('Missing parameter: supervisorConnection (Object)');
    }
    if (!supervisorConnection.url) {
        throw new Error('Invalid supervisorConnection, missing url property');
    }

    app.use("*", initializeSla);

    scopeResolver.init(app, supervisorConnection);
    bouncer.init(app, supervisorConnection);
    if (monitorConnection) {
        if (!monitorConnection.url) {
            throw new Error('Invalid monitorConnection, missing url property');
        }
        reporter.init(app, monitorConnection);
    }

    app.use(errorHandler);

    return this;
};

/**
 * Middleware that initialize `req.sla`.
 */
function initializeSla(req, res, next) {
    req.sla = {
        ts: new Date().getTime(),
        resource: req.url
    };
    return next();
}

/**
 * Middleware to handle `SlaError`.
 */
function errorHandler(err, req, res, next) {
    if (err.name === 'SlaError') {
        res.status(err.status).json({
            name: err.name,
            message: err.message
        }).end();
    }
    else {
        return next(err);
    }
}

/**
 * Expose `SlaManager`.
 */
module.exports = SlaManager;
