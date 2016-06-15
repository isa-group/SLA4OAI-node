/**
 * Module dependencies.
 */
var https = require("https");
var http = require("http");
var url = require("url");
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
        options.headers['Content-Length'] = Buffer.byteLength(payload, 'utf8');
    }

    injectBasicAuth(options.connection, requestOptions);

    var protocolStack = (uparts.protocol === "http:") ? http : https;

    var req = protocolStack.request(requestOptions, function (res) {
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            var body = JSON.parse(output);
            if (res.statusCode !== 200) {
                return callback(new SlaError(body.message, res.statusCode));
            }
            else {
                return callback(null, body);
            }
        });

    }).on("error", function (err) {
        return callback(new SlaError(err.message));
    });

    if (options.method === 'POST') {
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

// Expose public methods
module.exports = {
    request: request
};