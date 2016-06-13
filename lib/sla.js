/**
 * Module dependencies.
 */
var ScopeResolver = require('./components/scopeResolver');
var Bouncer = require('./components/bouncer');
var Reporter = require('./components/reporter');

/**
 * `sla` constructor.
 *
 * @api public
 */
function Sla() {
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
Sla.prototype.scopeResolver = scopeResolver;
Sla.prototype.bouncer = bouncer;
Sla.prototype.reporter = reporter;

/**
 * Register all library components as express middlewares.
 * Called once when the server getting up.
 *
 * Examples:
 *
 *     sla.register(app, supervisorConnection, monitorConnection);
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @param {Object} monitorConnection
 * @return {Sla} for chaining
 * @api public
 */
Sla.prototype.register = function (app, supervisorConnection, monitorConnection) {
    if (!app) {
        throw new Error('Missing parameter: app (Express)');
    }
    if (!supervisorConnection) {
        throw new Error('Missing parameter: supervisorConnection (Object)');
    }
    if (!supervisorConnection.url) {
        throw new Error('Invalid supervisorConnection, missing url property');
    }
    scopeResolver.init(app, supervisorConnection);
    bouncer.init(app, supervisorConnection);
    if (monitorConnection) {
        if (!monitorConnection.url) {
            throw new Error('Invalid monitorConnection, missing url property');
        }
        reporter.init(app, monitorConnection);
    }
    return this;
};

/**
 * Expose `Sla`.
 */
module.exports = Sla;
