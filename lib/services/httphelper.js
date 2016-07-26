/**
 * Module dependencies.
 */
var https = require("https");
var http = require("http");
var url = require("url");
var winston = require('winston');
var SlaError = require('../errors/slaerror');

/**
 * Warpper function for `http(s).request`.
 *
 * Examples:
 * 
 *     var options = {
 *          method: 'POST',
 *          connection: supervisorConnection,
 *          path: '{path}',
 *          body: body
 *      };
 *      httpHelper.request(options, function (err, result) {});
 *
 * @param {Object} options
 * @param {function} callback
 * @api public
 */
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
        requestOptions.headers['Content-Length'] = Buffer.byteLength(payload, 'utf8');
    }

    injectBasicAuth(options.connection, requestOptions);

    winston.level = 'debug';
    winston.log('debug', 'Request options: ' + JSON.stringify(requestOptions, null, 4));

    var protocolStack = (uparts.protocol === "http:") ? http : https;

    var req = protocolStack.request(requestOptions, function (res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {

            var body = null;
            try {
                body = JSON.parse(output);
            } catch (err) {
                body = output;
            }

            winston.log('debug', 'Response: (' + res.statusCode + ') ' + JSON.stringify(body, null, 4));

            if (res.statusCode === 200 || res.statusCode === 201) {
                return callback(null, body);
            }
            else {
                return callback(new SlaError(body.message, res.statusCode));
            }
        });

    }).on("error", function (err) {
        return callback(new SlaError(err.message));
    });

    if (options.method === 'POST') {
        winston.log('debug', 'Request body: ' + JSON.stringify(options.body, null, 4));
        req.write(payload);
    }

    req.end();
}

/**
 * Add Basic Authentication to `requestOptions`.
 *
 * @param {Object} connection
 * @param {Object} requestOptions
 * @api private
 */
function injectBasicAuth(connection, requestOptions) {
    if (connection.username && connection.password) {
        var encodedCredentials = toBase64(connection.username + ':' + connection.password);
        requestOptions.headers.Authorization = 'Basic ' + encodedCredentials;
    }
}

/**
 * Convert string to base64 format.
 *
 * @param {string} payload
 * @return {string} base64 string
 * @api private
 */
function toBase64(payload) {
    return new Buffer(payload).toString('base64');
}

/**
 * Expose public functions.
 */
module.exports = {
    request: request,
    winston: winston
};