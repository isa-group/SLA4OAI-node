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
function SlaManager() {
    this.scopeResolver = new ScopeResolver();
    this.bouncer = new Bouncer();
    this.reporter = new Reporter();
    this.sla4oaiUI = new Sla4oaiUI();
    this.winston = httpHelper.winston;
}

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

    app.use((req, res, next) => {
        req.slaManager = slaManager;
        next();
    })

    if (!configObj) {
        throw new Error('Missing parameter: configObj (Object)');
    }

    if (!configObj.sla4oai) {
        throw new Error('Missing parameter: configObj.sla4oai (String)');
    }

    var doc;
    //LOADING configObj from configObj.sla4oai
    loadSla4OaiDoc(configObj.sla4oai, (err, sla) => {

        if (err) return callback(null, err);

        fs.writeFileSync(__dirname + '/components/ui/design-files/plans.yaml', jsyaml.safeDump(sla));
        doc = sla;

        if (configObj.supervisorConnection) {
            doc.infrastructure.supervisor = configObj.supervisorConnection.url;
        }

        if (configObj.monitorConnection) {
            doc.infrastructure.monitor = configObj.monitorConnection.url;
        }

        if (!doc.infrastructure) {
            return callback(null, new Error('Invalid connections, missing infrastructure property'));
        } else {
            if (!doc.infrastructure.supervisor) {
                return callback(null, new Error('Invalid connections, missing infrastructure.supervisor property'));
            }
        }

        if (configObj.sla4oaiUI) {
            configObj.sla4oaiUI.url = configObj.sla4oai;
            this.sla4oaiUI.init(app, configObj.sla4oaiUI);
        } else {
            this.sla4oaiUI.init(app, {
                url: configObj.sla4oai
            });
        }

        app.use("*", initializeSla);

        var supervisorConnection = {
            url: doc.infrastructure.supervisor,
            service: doc.context.id
        }

        this.scopeResolver.init(app, supervisorConnection);
        this.bouncer.init(app, supervisorConnection);

        var monitorConnection = {
            url: doc.infrastructure.monitor
        }

        if (doc.infrastructure.monitor)
            this.reporter.init(app, monitorConnection);

        app.use(errorHandler);

        if (callback) return callback(slaManager);
        //return slaManager;
    });

};


function loadSla4OaiDoc(url, callback) {
    var slaObject;
    if (url.indexOf("http") == -1) {
        try {
            slaObject = jsyaml.safeLoad(fs.readFileSync(url, 'utf8'));
            callback(null, slaObject);
        } catch (e) {
            callback(e, null);
        }
    } else {
        request.get(url, {
            rejectUnauthorized: false
        }, (err, res, body) => {
            slaObject = jsyaml.safeLoad(body);
            if (!slaObject.context) {
                callback(new Error('Agreement file is not valid.'), null);
            } else if (!slaObject.infrastructure) {
                callback(new Error('Agreement file is not valid. infrastructure.supervisor and infrastructure.monitor are required.'));
            } else {
                callback(null, slaObject);
            }
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