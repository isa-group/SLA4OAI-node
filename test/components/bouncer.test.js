/* global describe, it, expect */
var chai = require('chai');
var bouncer = require('../../lib').bouncer;

describe('bouncer', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                environment: 'qa'
            };

            bouncer.configure(options);

            expect(bouncer._environment).to.equal(options.environment);
        });
    });

    describe('middleware', function () {
        var error;
        var requestBody;
        var environment = 'qa';
        var sla = {
            agreement: 'pro_petstore_YMkddfs',
            ts: "2016-01-12T12:57:37.345Z",
            resource: "/pets",
            method: "POST",
            scope: {
                account: 'ahmed@icinetic.com',
                tenant: 'icinetic'
            },
            requestedPayload: {
                reportType: '/type'
            }
        };
        before(function (done) {
            bouncer._environment = environment;
            bouncer.check = function (body, callback) {
                requestBody = body;
                callback(null, { accept: body.sla === 'pro_petstore_YMkddfs' });
            };
            done();
        });
        describe('"/check" api call', function () {
            before(function (done) {
                chai.connect.use(bouncer._middleware)
                    .req(function (req) {
                        req.query = {};
                        req.sla = sla;
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
            it('Valid request body', function () {
                expect(requestBody.sla).to.equal(sla.agreement);
                expect(requestBody.ts).to.equal(sla.ts);
                expect(requestBody.resource).to.equal(sla.resource);
                expect(requestBody.method).to.equal(sla.method);
                expect(requestBody.scope).to.equal(sla.scope);
                expect(requestBody.environment).to.equal(environment);
            });
        });
        describe('Not accepted', function () {
            before(function (done) {
                chai.connect.use(bouncer._middleware)
                    .req(function (req) {
                        req.query = {};
                        req.sla = sla;
                        req.sla.agreement = 'xx-Invalid Agreement-xx';
                    })
                    .next(function (err) {
                        error = err;
                        done();
                    })
                    .dispatch();
            });
            it('error', function () {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.name).to.equal('SlaError');
                expect(error.status).to.equal(403);
                expect(error.message.accept).to.equal(false);
            });
        });
    });
});