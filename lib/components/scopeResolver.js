/**
 * Module dependencies.
 */
var httpHelper = require('../services/httphelper');
var utilities = require('../services/utilities');
var SlaError = require('../errors/slaerror');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var WindowsLiveStrategy = require('passport-windowslive').Strategy;
var GitHubStrategy = require('passport-github2').Strategy;

/**
 * An instance of `ScopeResolver`
 */
var scopeResolver;

/**
 * `ScopeResolver` constructor.
 *
 * @api public
 */
function ScopeResolver() {
  scopeResolver = this;
}

/**
 * Intialize the ScopeResolver.
 *
 * @param {Express} app
 * @param {Object} supervisorConnection
 * @return {ScopeResolver} for chaining
 * @api internal
 */
ScopeResolver.prototype.init = function (app, connection) {
  this._app = app;
  this._connection = connection;
  this._middleware = resolveScope;
  this._app.use("*", this._middleware);

  return this;
};

/**
 * Configure the ScopeResolver.
 *
 * Examples:
 *
 *     slaManager.scopeResolver.configure(options);
 *
 * @param {Object} options
 * @return {ScopeResolver} for chaining
 * @api public
 */
ScopeResolver.prototype.configure = function (options) {
  options = options || {};
  this._oauthProvider = options.oauthProvider;
  this._config = options.config;
  return this;
};

/**
 * Retrive the scope components from the tenants api
 *
 * @param {string} paramName
 * @param {string} paramValue
 * @param {function} callback
 * @api public
 */
ScopeResolver.prototype.getAccountScope = function (paramName, paramValue, callback) {
  var options = {
    method: 'GET',
    connection: scopeResolver._connection,
    path: '/tenants?' + paramName + '=' + paramValue
  };

  httpHelper.request(options, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};

/**
 * Get the account name from the outh provider based on the given token.
 *
 * @param {string} provider
 * @param {string} token
 * @param {function} callback
 * @api private
 */
ScopeResolver.prototype.getAccountName = function (token, callback) {
  switch (scopeResolver._oauthProvider) {
    case "google":
      return getGoogleAccountName(token, scopeResolver._config.google, callback);
    case "facebook":
      return getFacebookAccountName(token, scopeResolver._config.facebook, callback);
    case "windowsLive":
      return getWindowsLiveAccountName(token, scopeResolver._config.windowsLive, callback);
    case "github":
      return getGithubAccountName(token, scopeResolver._config.github, callback);
    default:
      return callback(new SlaError('Invalid oauthProvider: ' + scopeResolver._oauthProvider));
  }
};

/**
 * Middleware that resolve the scope components from the tenants api.
 */
function resolveScope(req, res, next) {
  if (req.query.apikey) {
    return setAccountScope('apikey', req.query.apikey, req, next);
  }
  else if (req.headers.authorization && utilities.startsWith(req.headers.authorization, 'Bearer ')) {
    var token = req.headers.authorization.substr(7);
    scopeResolver.getAccountName(token, function (err, accountName) {
      if (err) {
        return next(err);
      }

      return setAccountScope('account', accountName, req, next);
    });
  }
  else {
    return next(new SlaError('You need to pass apikey or Bearer token.', 401));
  }
}

/**
 * Function that set `agreement`, `scope`, and `requestedPayload` in `req.sla` .
 *
 * @param {string} paramName
 * @param {string} paramValue
 * @param {object} req
 * @param {function} next
 * @api private
 */
function setAccountScope(paramName, paramValue, req, next) {
  scopeResolver.getAccountScope(paramName, paramValue, function (err, result) {
    if (err) {
      return next(err);
    }

    req.sla.agreement = result.sla;
    req.sla.scope = result.scope;
    req.sla.requestedPayload = result.requestedPayload;

    return next();
  });
}

/**
 * Get the account name from Google provider based on the given token.
 *
 * @param {string} token
 * @param {object} config
 * @param {function} callback
 * @api private
 */
function getGoogleAccountName(token, config, callback) {
  var strategy = new GoogleStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, true);
  });
  strategy.userProfile(token, function (err, profile) {
    if (err) {
      return callback(new SlaError(err.name + ': ' + err.message, err.code));
    }

    if (profile && profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
      var email = profile.emails[0].value.toLowerCase();
      return callback(null, email);
    }
    else {
      return callback(new SlaError('Can not retrive profile form Google OAuth Provider'));
    }
  });
}

/**
 * Get the account name from Facebook provider based on the given token.
 *
 * @param {string} token
 * @param {object} config
 * @param {function} callback
 * @api private
 */
function getFacebookAccountName(token, config, callback) {
  var strategy = new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    profileFields: ['emails']
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, true);
  });
  strategy.userProfile(token, function (err, profile) {
    if (err) {
      return callback(new SlaError(err.name + ': ' + err.message, err.status));
    }
    if (profile && profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
      var email = profile.emails[0].value.toLowerCase();
      return callback(null, email);
    }
    else {
      return callback(new SlaError('Can not retrive profile form Facebook OAuth Provider'));
    }
  });
}

/**
 * Get the account name from Windows Live provider based on the given token.
 *
 * @param {string} token
 * @param {object} config
 * @param {function} callback
 * @api private
 */
function getWindowsLiveAccountName(token, config, callback) {
  var strategy = new WindowsLiveStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, true);
  });
  strategy.userProfile(token, function (err, profile) {
    if (err) {
      return callback(new SlaError(err.name + ': ' + err.message, err.code));
    }

    if (profile && profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
      var email = profile.emails[0].value.toLowerCase();
      return callback(null, email);
    }
    else {
      return callback(new SlaError('Can not retrive profile form Windows Live OAuth Provider'));
    }
  });
}

/**
 * Get the account name from Github provider based on the given token.
 *
 * @param {string} token
 * @param {object} config
 * @param {function} callback
 * @api private
 */
function getGithubAccountName(token, config, callback) {
  var strategy = new GitHubStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['user:email']
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, true);
  });
  strategy.userProfile(token, function (err, profile) {
    if (err) {
      return callback(new SlaError(err.name + ': ' + err.message, err.code));
    }
    if (profile && profile.emails && profile.emails.length > 0 && profile.emails[0].value) {
      var email = profile.emails[0].value.toLowerCase();
      return callback(null, email);
    }
    else {
      return callback(new SlaError('Can not retrive profile form Github OAuth Provider'));
    }
  });
}

/**
 * Expose `ScopeResolver`.
 */
module.exports = ScopeResolver;
