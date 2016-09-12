/**
 * Module dependencies.
 */
var logger = require('../services/httphelper').winston;

/**
 * An instance of `sla4oaiUI`
 */
var sla4oaiUIredirect;

function Sla4oaiUIredirect (){

    sla4oaiUIredirect = this;

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
 *   plansURL: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
 *   portalURL: "http://portal.oai.governify.io/oai/#/portal"
 * }
 * @api public
 */
Sla4oaiUIredirect.prototype.init = function (app, options) {

    if (!app) {
        throw new Error('Missing parameter: app (Express)');
    }
    if (!options) {
        throw new Error('Missing parameter: options (Object)');
    }
    if (options){
        if(!options.path) options.path = "/plans";

        if(!options.portalSuccessRedirect){
            throw new Error('Missing options: options.portalSuccessRedirect (String)');
        }
        if(!options.plansURL){
            throw new Error('Missing options: options.plansURL (String)');
        }
        if(!options.portalURL){
            throw new Error('Missing options: options.portalURL (String)');
        }

        this._options = options;
        this._middleware = redirect;
    }

    logger.debug("Initializing sla4oaiUI on path = %s", this._options.path);
    logger.debug("** portalSuccessRedirect = %s", this._options.portalSuccessRedirect);
    logger.debug("** plansURL = %s",this._options.plansURL);
    logger.debug("** portalURL = %s", this._options.portalURL);

    app.use( this._options.path , this._middleware);
}

function redirect (req, res, next) {

    var redirection = sla4oaiUIredirect._options.portalURL + "?plans=" +
            sla4oaiUIredirect._options.plansURL + "&redirect=" + sla4oaiUIredirect._options.portalSuccessRedirect ;
    logger.debug("REDIRECTION to : %s", redirection);

    try{

       logger.debug("ExpressJS mode redirection");
       res.redirect( redirection ); // redirect is only implemented on ExpressJS

    }catch (e){ // add support for other frameworks like ConnectJS

        logger.debug("ConnectJS mode redirection");
        res.statusCode = 300;
        res.setHeader('location', redirection);
        res.end();

    }

}

module.exports = Sla4oaiUIredirect;
