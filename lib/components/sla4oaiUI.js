/**
 * Module dependencies.
 */
var logger = require('../services/httphelper').winston;
var express = require('express');
var fs = require('fs');

/**
 * An instance of `sla4oaiUI`
 */
var Sla4oaiUI;

function Sla4oaiUI() {

    Sla4oaiUI = this;

}

/**
 * `sla4oaiUI` constructor.
 *
 * Registers the middleware.
 *
 * Examples:
 *
 *     Slamanager.register(app, supervisorConnection, monitorConnection);
 *
 * @param {Express} app
 * @param {Object} options
 * {
 *   path: "/plans",
 *   portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
 *   url: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
 *   portalURL: "http://portal.oai.governify.io/oai/#/portal"
 * }
 * @api public
 */
Sla4oaiUI.prototype.init = function (app, options) {

    if (!app) {
        throw new Error('Missing parameter: app (Express)');
    }
    if (!options) {
        throw new Error("Missing parameter: options (Object)");
    } else {
        if (!options.path) options.path = "/plans";

        if (!options.portalSuccessRedirect) options.portalSuccessRedirect = "/docs";

        if (!options.url) {
            throw new Error('Missing options: options.url (String)');
        } else {

            if (options.url.indexOf("http") == -1) {

                options.url = "/plans/oai/design-files/plans.yaml";

            }
        }

        this._options = options;
        this._middleware = redirect;
    }

    logger.debug("Initializing sla4oaiUI on path = %s", this._options.path);
    logger.debug("** portalSuccessRedirect = %s", this._options.portalSuccessRedirect);
    logger.debug("** plans = %s", this._options.url);
    logger.debug("** portalURL = %s", this._options.portalURL ? this._options.portalURL : "Internal portal mode");

    if (!options.portalURL) {
        app.use(this._options.path + "/oai", express.static(__dirname + '/ui'));
    }

    app.use(this._options.path, this._middleware);
}

/**
 * Configure the Sla4oaiUI.
 *
 * Examples:
 *
 *     slaManager.sla4oaiUI.configure(options);
 *
 * @param {Object} options
 * @return {Sla4oaiUI} for chaining
 * @api public
 */
Sla4oaiUI.prototype.configure = function (options) {
    options = options || {};
    for (var o in options) {
        this._options[o] = options[o];
    }
    return this;
};


function redirect(req, res, next) {

    var params = req.query ? req.query : req.params;
    var redirection;
    if (Sla4oaiUI._options.portalURL) {
        redirection = Sla4oaiUI._options.portalURL + "?plans=" +
            Sla4oaiUI._options.url + "&redirect=" + Sla4oaiUI._options.portalSuccessRedirect + (params && params.apikey ? "&apikey=" + params.apikey : '');
    } else {
        redirection = "/plans/oai/#/portal?plans=" +
            Sla4oaiUI._options.url + "&redirect=" + Sla4oaiUI._options.portalSuccessRedirect + (params && params.apikey ? "&apikey=" + params.apikey : '');
    }

    logger.debug("REDIRECTION to : %s", redirection);

    try {

        logger.debug("ExpressJS mode redirection");
        res.redirect(redirection); // redirect is only implemented on ExpressJS

    } catch (e) { // add support for other frameworks like ConnectJS

        logger.debug("ConnectJS mode redirection");
        res.statusCode = 300;
        res.setHeader('location', redirection);
        res.end();

    }

}

module.exports = Sla4oaiUI;
