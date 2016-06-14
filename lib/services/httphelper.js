/**
 * Module dependencies.
 */
var https = require("https");
var http = require("http");
var url = require("url");
var SlaError = require('../errors/slaerror');

function request(options, callback) {
    var output = '';
    var uparts = url.parse(options.connection.url + options.path);

    var requestOptions = {
        method: options.method,
        host: uparts.hostname,
        port: uparts.port || ((uparts.protocol === 'http:') ? 80 : 443),
        path: (uparts.path || '') + (uparts.hash || ''),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    var payload = '';
    if (options.method === 'POST') {
        if (options.body) {
            payload = JSON.stringify(options.body);
        }
        options.headers['Content-Length'] = Buffer.byteLength(payload, 'utf8');
    }

    injectBasicAuth(options.connection, requestOptions);

    var protocolStack = (uparts.protocol === "http:") ? http : https;

    console.log('>> requestOptions: ' + JSON.stringify(requestOptions));
    var req = protocolStack.request(requestOptions, function (res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            return callback(null, JSON.parse(output));
        });

    }).on("error", function (err) {
        return callback(new SlaError(err.message));
    });

    if (options.method === 'POST') {
        req.write(payload);
    }
    req.end();
}

function injectBasicAuth(connection, requestOptions) {
    if (connection.username && connection.password) {
        var encodedCredentials = toBase64(connection.username + ':' + connection.password);
        requestOptions.headers.Authorization = 'Basic ' + encodedCredentials;
    }
}

function toBase64(payload) {
    return new Buffer(payload).toString('base64');
}

// Expose public methods
module.exports = {
    request: request
};