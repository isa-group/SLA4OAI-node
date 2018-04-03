/* global describe, it, expect */

var sla4oaiTools = require('..');
var slaManager = new sla4oaiTools();

var mockExpressApp = {
    use: function () { }
};
describe('SlaManager', function () {
    describe('#initialize', function () {
        describe('Validate parameters', function () {
            it('should throw if lacking express app parameter', function () {
                expect(function () {
                    slaManager.initialize();
                }).to.throw(Error, 'Missing parameter: app (Express)');
            });
            it('should throw if lacking configObj parameter', function () {
                expect(function () {
                    slaManager.initialize(mockExpressApp);
                }).to.throw(Error, 'Missing parameter: configObj (Object)');
            });
            it('should throw if missing sla4oaiDoc url in configObj parameter', function () {
                expect(function () {
                    var configObj = {};
                    slaManager.initialize(mockExpressApp, configObj);
                }).to.throw(Error, 'Missing parameter: configObj.sla4oai (String)');
            });
        });

        describe('Components initialization', function () {
            it('scopeResolver is initialized', function () {
                // Reset
                slaManager.scopeResolver._app = undefined;
                slaManager.scopeResolver._connection = undefined;

                var configObj = {
                    sla4oai: __dirname + "/sampleServer/petstore-plans.yaml"
                };
                slaManager.initialize(mockExpressApp, configObj);

                expect(slaManager.scopeResolver._app).to.equal(mockExpressApp);
                expect(slaManager.scopeResolver._connection).to.eql({
                    url: 'http://supervisor.oai.governify.io/api/v2',
                    service: 'petstore-sample'
                });
            });
            it('bouncer is initialized', function () {
                // Reset
                slaManager.bouncer._app = undefined;
                slaManager.bouncer._connection = undefined;

                var configObj = {
                    sla4oai: __dirname + "/sampleServer/petstore-plans.yaml"
                };
                slaManager.initialize(mockExpressApp, configObj);

                expect(slaManager.bouncer._app).to.equal(mockExpressApp);
                expect(slaManager.bouncer._connection).to.eql({
                    url: 'http://supervisor.oai.governify.io/api/v2',
                    service: 'petstore-sample'
                });
            });
            it('reporter is initialized when monitorConnection parameter present', function () {
                // Reset
                slaManager.reporter._app = undefined;
                slaManager.reporter._connection = undefined;

                var configObj = {
                    sla4oai: __dirname + "/sampleServer/petstore-plans.yaml"
                };
                slaManager.initialize(mockExpressApp, configObj);

                expect(slaManager.reporter._app).to.equal(mockExpressApp);
                expect(slaManager.reporter._connection).to.eql({
                    url: 'http://monitor.oai.governify.io/api/v1'
                });
            });
        });
        describe('Return value', function () {
            it('should return SlaManager for chaining', function (done) {
                var configObj = {
                    sla4oai: __dirname + "/sampleServer/petstore-plans.yaml"
                };
                var returnValue = null;
                slaManager.initialize(mockExpressApp, configObj, (value) => {
                    returnValue = value;
                    expect(returnValue).to.equal(slaManager);
                    done();
                });
            });
        });
    });
});
