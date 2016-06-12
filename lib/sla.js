/**
 * Module dependencies.
 */
var ScopeResolver = require('./scopeResolver');
var Bouncer = require('./bouncer');
var Reporter = require('./reporter');

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
    scopeResolver.init(app, supervisorConnection);
    bouncer.init(app, supervisorConnection);
    reporter.init(app, monitorConnection);
    return this;
};

/**
 * Expose `Sla`.
 */
module.exports = Sla;
