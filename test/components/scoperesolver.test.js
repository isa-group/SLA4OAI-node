/* global describe, it, expect */
var chai = require('chai');
var scopeResolver = require('../../lib').scopeResolver;
var SlaError = require('../../lib/errors/slaerror');

describe('scopeResolver', function () {
    describe('configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                defaultOAuthProvider: 'google',
                config: {
                    google: {
                        clientId: '6076-d1m.apps.googleusercontent.com',
                        clientSecret: '1lWx9DDDaPo9kxF4yu6t_loJ',
                        callbackURL: 'https://app.myservice.com/google/callback'
                    }
                }
            };

            scopeResolver.configure(options);

            expect(scopeResolver._defaultOAuthProvider).to.equal(options.defaultOAuthProvider);
            expect(scopeResolver._config).to.equal(options.config);
        });
    });
    describe('middleware Error', function () {
        var error;
        before(function (done) {
            chai.connect.use(scopeResolver._middleware)
                .req(function (req) {
                    req.query = {};
                })
                .next(function (err) {
                    error = err;
                    done();
                })
                .dispatch();
        });
        it('When missing apikey and Bearer token', function () {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.name).to.equal('SlaError');
            expect(error.status).to.equal(401);
            expect(error.message).to.equal('You need to pass apikey or Bearer token.');
        });
    });
    describe('middleware with apikey', function () {
        var queryName, queryValue, request, error;
        var apikey = 'NbfiS7wjwjwb=';
        var tenantsResult = {
            sla: 'pro_petstore_YMkddfs',
            scope: {
                account: 'ahmed@icinetic.com',
                tenant: 'icinetic'
            },
            requestedPayload: {
                reportType: '/type'
            }
        };


        before(function (done) {
            scopeResolver.getAccountScope = function (paramName, paramValue, callback) {
                queryName = paramName;
                queryValue = paramValue;
                callback(null, tenantsResult);
            };
            chai.connect.use(scopeResolver._middleware)
                .req(function (req) {
                    req.sla = {};
                    req.query = { apikey: apikey };
                    request = req;
                })
                .next(function (err) {
                    error = err;
                    done();
                })
                .dispatch();
        });

        it('should not error', function () {
            expect(error).to.be.undefined;
        });
        it('request query should parsed correctly', function () {
            expect(queryName).to.equal('apikey');
            expect(queryValue).to.equal(apikey);
        });
        it('should set correct request.sla', function () {
            expect(request.sla).to.be.an('Object');
            expect(request.sla.agreement).to.equal(tenantsResult.sla);
            expect(request.sla.scope).to.equal(tenantsResult.scope);
            expect(request.sla.requestedPayload).to.equal(tenantsResult.requestedPayload);
        });
    });
    describe('middleware with bearer token', function () {
        var queryName2, queryValue2, request2, error2;
        var email = 'negmsoftware@gmail.com';
        var actualToken = 'ya29.CjUGA6l63n4LYBPxDnxATm05S8Lp9LM-o7me5n0jwoTpEVTmHgFIC8FsVBYK3bSu8TkvmVob6w';
        var tenantsResult2 = {
            sla: 'pro_petstore_YMkddfs',
            scope: {
                account: email,
                tenant: 'icinetic'
            },
            requestedPayload: {
                reportType: '/type'
            }
        };
        before(function (done) {
            scopeResolver.getAccountName = function (oauthProvider, token, callback) {
                if (token === actualToken) {
                    callback(null, email);
                }
                else {
                    return callback(new SlaError('Invalid token'));
                }

            };
            scopeResolver.getAccountScope = function (paramName, paramValue, callback) {
                queryName2 = paramName;
                queryValue2 = paramValue;
                callback(null, tenantsResult2);
            };
            done();
        });

        describe('Invalid token', function () {
            before(function (done) {
                chai.connect.use(scopeResolver._middleware)
                    .req(function (req) {
                        req.sla = {};
                        req.query = {};
                        req.headers = {
                            authorization: 'Bearer ' + 'xx-invalid token-xx'
                        };
                        request2 = req;
                    })
                    .next(function (err) {
                        error2 = err;
                        done();
                    })
                    .dispatch();
            });
            it('Raise SlaError', function () {
                expect(error2).to.be.an.instanceOf(Error);
                expect(error2.name).to.equal('SlaError');
                expect(error2.message).to.equal('Invalid token');
            });
        });
        describe('Valid token', function () {
            before(function (done) {
                chai.connect.use(scopeResolver._middleware)
                    .req(function (req) {
                        req.sla = {};
                        req.query = {};
                        req.headers = {
                            authorization: 'Bearer ' + actualToken
                        };
                        request2 = req;
                    })
                    .next(function (err) {
                        error2 = err;
                        done();
                    })
                    .dispatch();
            });
            it('should not error', function () {
                expect(error2).to.be.undefined;
            });
            it('request query should parsed correctly', function () {
                expect(queryName2).to.equal('account');
                expect(queryValue2).to.equal(email);
            });
            it('should set correct request.sla', function () {
                expect(request2.sla).to.be.an('Object');
                expect(request2.sla.agreement).to.equal(tenantsResult2.sla);
                expect(request2.sla.scope).to.equal(tenantsResult2.scope);
                expect(request2.sla.requestedPayload).to.equal(tenantsResult2.requestedPayload);
            });
        });
    });
});