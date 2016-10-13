/**
 * Module dependencies.
 */
var ScopeResolver = require('./components/scopeResolver');
var Bouncer = require('./components/bouncer');
var Reporter = require('./components/reporter');
var Sla4oaiUI = require('./components/sla4oaiUI');
var httpHelper = require('./services/httphelper');
var fs = require('fs');
var jsyaml = require('js-yaml');
var request = require('request');

/**
 * `SlaManager` constructor.
 *
 * @api public
 */
function SlaManager() {}

/**
 * Instantiate the components
 */
var scopeResolver = new ScopeResolver();
var bouncer = new Bouncer();
var reporter = new Reporter();
var sla4oaiUI = new Sla4oaiUI();

/**
 * Expose the components
 */
SlaManager.prototype.scopeResolver = scopeResolver;
SlaManager.prototype.bouncer = bouncer;
SlaManager.prototype.reporter = reporter;
SlaManager.prototype.sla4oaiUI = sla4oaiUI;
SlaManager.prototype.winston = httpHelper.winston;

/**
 * Initialize all library components and return express middlewares.
 * Called once when the server getting up.
 *
 * Examples:
 *
 *     Slamanager.initialize(sla4oaiDoc);
 *
 * @param {Sla4oaiDoc} sla4oaiDoc
 * @return {SlaManager} for chaining
 * @api public
 */
SlaManager.prototype.initialize = function (app, configObj, callback) {
    var slaManager = this;
    if (!app) {
        throw new Error('Missing parameter: app (Express)');
    }

    if (!configObj) {
        throw new Error('Missing parameter: configObj (Object)');
    }

    if (!configObj.sla4oai) {
        throw new Error('Missing parameter: configObj.sla4oai (String)');
    }

    var doc;
    //LOADING configObj from configObj.sla4oai
    loadSla4OaiDoc(configObj.sla4oai, (err, sla) => {

        if (err) throw err;

        fs.writeFileSync(__dirname + '/components/ui/design-files/plans.yaml', sla);
        doc = jsyaml.safeLoad(sla);

        if (configObj.supervisorConnection) {
            doc.infrastructure.supervisor = configObj.supervisorConnection.url;
        }

        if (configObj.monitorConnection) {
            doc.infrastructure.monitor = configObj.monitorConnection.url;
        }

        if (!doc.infrastructure.supervisor) {
            throw new Error('Invalid supervisorConnection, missing infrastructure.supervisor property');
        }

        if (configObj.sla4oaiUI) {
            configObj.sla4oaiUI.url = configObj.sla4oai;
            sla4oaiUI.init(app, configObj.sla4oaiUI);
        }

        app.use("*", initializeSla);

        var supervisorConnection = {
            url: doc.infrastructure.supervisor,
            service: doc.context.id
        }

        scopeResolver.init(app, supervisorConnection);
        bouncer.init(app, supervisorConnection);

        var monitorConnection = {
            url: doc.infrastructure.monitor
        }

        if (doc.infrastructure.monitor)
            reporter.init(app, monitorConnection);

        app.use(errorHandler);

        if (callback) callback(slaManager);
        return slaManager;

    });

};


function loadSla4OaiDoc(url, callback) {
    var slaString;
    if (url.indexOf("http") == -1) {
        try {
            slaString = fs.readFileSync(url, 'utf8');
            callback(null, slaString);
        } catch (e) {
            callback(e, null);
        }
    } else {
        request.get(url, {
            rejectUnauthorized: false
        }, (err, res, body) => {
            slaString = body;
            callback(null, slaString);
        }).on('error', (e) => {
            callback(e, null);
        });
    }
}

/**
 * Middleware that initialize `req.sla`.
 */
function initializeSla(req, res, next) {
    req.sla = {
        ts: new Date().toISOString(),
        resource: req.originalUrl,
        method: req.method
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
    } else {
        return next(err);
    }
}

/**
 * Expose `SlaManager`.
 */
module.exports = SlaManager;
