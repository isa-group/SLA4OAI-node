var slaManager = require('../../lib');
var express = require('express');
var app = express();

var port = 3000;
var pets = [
    {
        name: 'Buddy',
        tag: 'dog'
    },
    {
        name: 'Daisy',
        tag: 'cat'
    }
];

var supervisorConnection = {
    url: 'http://supervisor.oai.governify.io/api/v1'
};

var monitorConnection = {
    url: 'http://monitor.oai.governify.io/api/v1/'
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

slaManager.register(app, supervisorConnection, monitorConnection);

slaManager.scopeResolver.configure(scopeResolverOptions);

/*
// Bouncer Extensions
slaManager.bouncer.needChecking = function (req) {
    return true;
}

slaManager.bouncer.decline = function (req, res, next, supervisorPayload) {
    res.status(403).json({
        message: 'SLA Violation: ' + supervisorPayload.reason
    }).end();
}
*/

app.get('/pets', function (req, res) {
    res.status(200).json(pets);
});

app.listen(port, function () {
    console.log('Sample app listening on port 3000!');
});