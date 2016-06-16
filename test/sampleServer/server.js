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
    oauthProvider: 'google',
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
        }
    }
};

slaManager.register(app, supervisorConnection, monitorConnection);

slaManager.scopeResolver.configure(scopeResolverOptions);

app.get('/pets', function (req, res) {
    res.status(200).json(pets);
});

app.listen(port, function () {
    console.log('Sample app listening on port 3000!');
});