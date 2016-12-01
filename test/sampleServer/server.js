var express = require('express');
var bodyParser = require('body-parser');

var sla4oaiTools = require('../../lib');
var slaManager = new sla4oaiTools();

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


var port = 3000;
var pets = [{
    name: 'Buddy',
    tag: 'dog'
}, {
    name: 'Daisy',
    tag: 'cat'
}];

var supervisorConnection = {
    url: 'http://supervisor.oai.governify.io/api/v1'
};

var monitorConnection = {
    url: 'http://monitor.oai.governify.io/api/v1'
};

var scopeResolverOptions = {
    defaultOAuthProvider: 'google',
    config: {
        google: {
            clientId: '323051689948-tcmek8pmu3jmof2clamm01imq11vc8i5.apps.googleusercontent.com',
            clientSecret: 'nCDDfAjsJLLp2zazsMYSFgUD',
            callbackURL: 'https://library-resource.herokuapp.com/oauth2/google/callback'
        },
        facebook: {
            clientId: '181024012249068',
            clientSecret: '5bee91e598fd01a64de44cd74e285d7a',
            callbackURL: 'https://library-resource.herokuapp.com/oauth2/facebook/callback'
        },
        windowsLive: {
            clientId: '000000004C177F07',
            clientSecret: 'E93it0p8id5uRWlFvM8o9QwSpmIO-xaT',
            callbackURL: 'https://library-resource.herokuapp.com/oauth2/windowslive/callback'
        },
        github: {
            clientId: '75313d883774bbcdd1d5',
            clientSecret: '526308d41d59715df7e69df3de52bc9a4a6a9b0f',
            callbackURL: 'https://library-resource.herokuapp.com/oauth2/github/callback'
        }
    }
};

var reporterOptions = {
    autoReport: true,
    //aggregate: true,
    //aggregationPeriod: 15000,
    cluster: 'cl1.acme.com',
    environment: 'qa'
};

var configObj = {
    sla4oai: __dirname + "/petstore-plans.yaml",
    supervisorConnection: {
        url: 'http://supervisor.oai.governify.io/api/v2'
    },
    monitorConnection: {
        url: 'http://monitor.oai.governify.io/api/v1'
    },
    sla4oaiUI: {
        portalSuccessRedirect: "/pets"
    }
}

slaManager.initialize(app, configObj, () => {
    slaManager.scopeResolver.configure(scopeResolverOptions);

    slaManager.reporter.configure(reporterOptions);


    app.get('/pets', function (req, res) {
        slaManager.reporter.setMetric(req, "animalTypes", pets.length);
        res.status(200).json(pets);
    });

    app.post('/pets', function (req, res) {
        res.status(200).json(pets);
        //slaManager.reporter.reportMetrics();
    });

    app.listen(port, function () {
        console.log('Sample app listening on port 3000!');
    });

});




/*
// Bouncer Extensions
slaManager.bouncer.needChecking = function (req) {
    return true;
};

slaManager.bouncer.decline = function (req, res, next, supervisorPayload) {
    res.status(403).json({
        message: 'SLA Violation: ' + supervisorPayload.reason
    }).end();
};


slaManager.bouncer.resolveMetrics = function (requestedMetrics, req) {
    return {
        nameLegth: 12
    };
};

slaManager.reporter.preCalculateMetrics = function (requestedMetrics, req, next) {
    req.sla.metrics["x-preCalculateMetrics"] = "pre";
    next();
};

slaManager.reporter.postCalculateMetrics = function (requestedMetrics, req, res, next) {
    req.sla.metrics["x-postCalculateMetrics"] = "post";
    next();
};

slaManager.winston.add(slaManager.winston.transports.File, { filename: 'somefile.log' });
slaManager.winston.remove(slaManager.winston.transports.Console);

*/
