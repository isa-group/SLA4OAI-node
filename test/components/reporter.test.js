/* global describe, it, expect */
var chai = require('chai');
var sla4oaiTools = require('../../lib');
var slaManager = new sla4oaiTools();
var reporter = slaManager.reporter;

describe('reporter', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                autoReport: true,
                aggregate: false,
                aggregationPeriod: 100,
                cluster: 'cl1.acme.com',
                environment: 'qa'
            };

            reporter.configure(options);

            expect(reporter._autoReport).to.equal(options.autoReport);
            expect(reporter._aggregate).to.equal(options.aggregate);
            expect(reporter._aggregationPeriod).to.equal(options.aggregationPeriod);
            expect(reporter._cluster).to.equal(options.cluster);
            expect(reporter._environment).to.equal(options.environment);
        });
    });

    describe('middleware - no requested metrics', function () {
        var error;
        var preCalculateMetricsCalled = false;
        var isReported = false;
        before(function (done) {
            reporter.preCalculateMetrics = function (requestedMetrics, req, next) {
                preCalculateMetricsCalled = true;
                next();
            };
            reporter.report = function (body, next) {
                isReported = true;
                next();
            };
            chai.connect.use(reporter._middleware)
                .req(function (req) {
                    req.sla = {
                        requestedMetrics: [],
                        metrics: []
                    };
                    req.headers = [];
                    req.slaManager = slaManager;
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
        it('should not report metrics', function () {
            expect(preCalculateMetricsCalled).to.equal(false);
            expect(isReported).to.equal(false);
        });
    });
    describe('middleware', function () {
        var error, request, response, reportedBody;
        var preCalculateMetricsCalled = false;
        var postCalculateMetricsCalled = false;
        var isReported = false;
        var ts = new Date().toISOString();
        before(function (done) {
            reporter.preCalculateMetrics = function (requestedMetrics, req, next) {
                preCalculateMetricsCalled = true;
                next();
            };
            reporter.postCalculateMetrics = function (requestedMetrics, req, res, next) {
                postCalculateMetricsCalled = true;
                next();
            };
            reporter.report = function (body, next) {
                isReported = true;
                reportedBody = body;
                next();
            };
            chai.connect.use(reporter._middleware)
                .req(function (req) {
                    req.sla = {
                        resource: '/pets',
                        method: 'GET',
                        ts: ts,
                        requestedMetrics: ['userAgent', 'requestBody', 'responseHeaders', 'responseTime'],
                        metrics: {}
                    };
                    req.headers = {
                        'user-agent': 'userAgent'
                    };
                    req.body = {
                        'id': 1
                    };
                    req.slaManager = slaManager;
                    request = req;
                })
                .res(function (res) {
                    res.on = function (action, callback) {
                        callback();
                    };
                    res._headers = {
                        'content-type': 'json'
                    };
                    res.body = {
                        'id': 1,
                        'name': 'pet1'
                    };
                    response = res;
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
        it('preCalculateMetrics populate metrics', function () {
            expect(request.sla.startTime).to.not.be.null;
            expect(request.sla.startTime).to.not.be.undefined;
            expect(request.sla.metrics.requestHeaders).to.be.undefined;
            expect(request.sla.metrics.userAgent).to.equal(request.headers["user-agent"]);
        });
        it('postCalculateMetrics populate metrics', function () {
            expect(request.sla.metrics.responseTime).to.not.be.null;
            expect(request.sla.metrics.responseTime).to.not.be.undefined;
            expect(request.sla.metrics.responseBody).to.be.undefined;
            expect(request.sla.metrics.requestBody).to.equal(request.body);
            expect(request.sla.metrics.responseHeaders).to.equal(response._headers);
        });
        it('should call extensions', function () {
            expect(preCalculateMetricsCalled).to.equal(true);
            expect(postCalculateMetricsCalled).to.equal(true);
        });
        it('should report metrics', function () {
            expect(isReported).to.equal(true);
        });
        it('report correct metrics', function () {
            var measure = reportedBody.measures[0];
            expect(measure.resource).to.equal(request.sla.resource);
            expect(measure.method).to.equal(request.sla.method);
            expect(measure.result).to.equal(200);
            expect(measure.ts).to.equal(request.sla.ts);
            expect(measure.metrics.userAgent).to.equal(request.headers["user-agent"]);
            expect(measure.metrics.requestBody).to.equal(request.body);
            expect(measure.metrics.responseHeaders).to.equal(response._headers);
            expect(measure.metrics.responseTime).to.not.be.null;
            expect(measure.metrics.responseTime).to.not.be.undefined;
        });
    });
});
