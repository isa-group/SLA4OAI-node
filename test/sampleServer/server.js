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

slaManager.register(app, supervisorConnection, monitorConnection);

app.get('/pets', function (req, res) {
    res.status(200).json(pets);
});

app.listen(port, function () {
    console.log('Sample app listening on port 3000!');
});