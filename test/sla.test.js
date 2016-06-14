/* global describe, it, expect */

var slaManager = require('..');
var mockExpressApp = {
    use: function () { }
};
describe('SlaManager', function () {
    describe('#register', function () {
        describe('Validate parameters', function () {
            it('should throw if lacking express app parameter', function () {
                expect(function () {
                    slaManager.register();
                }).to.throw(Error, 'Missing parameter: app (Express)');
            });
            it('should throw if lacking supervisorConnection parameter', function () {
                expect(function () {
                    slaManager.register(mockExpressApp);
                }).to.throw(Error, 'Missing parameter: supervisorConnection (Object)');
            });
            it('should throw if missing url in supervisorConnection parameter', function () {
                expect(function () {
                    var supervisorConnection = {};
                    slaManager.register(mockExpressApp, supervisorConnection);
                }).to.throw(Error, 'Invalid supervisorConnection, missing url property');
            });
            it('should throw if missing url in monitorConnection parameter', function () {
                expect(function () {
                    var supervisorConnection = { url: 'url' };
                    var monitorConnection = {};
                    slaManager.register(mockExpressApp, supervisorConnection, monitorConnection);
                }).to.throw(Error, 'Invalid monitorConnection, missing url property');
            });
        });

        describe('Components initialization', function () {
            it('scopeResolver is initialized', function () {
                // Reset
                slaManager.scopeResolver._app = undefined;
                slaManager.scopeResolver._connection = undefined;

                var supervisorConnection = { url: 'url' };
                slaManager.register(mockExpressApp, supervisorConnection);

                expect(slaManager.scopeResolver._app).to.equal(mockExpressApp);
                expect(slaManager.scopeResolver._connection).to.equal(supervisorConnection);
            });
            it('bouncer is initialized', function () {
                // Reset
                slaManager.bouncer._app = undefined;
                slaManager.bouncer._connection = undefined;

                var supervisorConnection = { url: 'url' };
                slaManager.register(mockExpressApp, supervisorConnection);

                expect(slaManager.bouncer._app).to.equal(mockExpressApp);
                expect(slaManager.bouncer._connection).to.equal(supervisorConnection);
            });
            it('reporter is not initialized when monitorConnection parameter missing', function () {
                // Reset
                slaManager.reporter._app = undefined;
                slaManager.reporter._connection = undefined;

                var supervisorConnection = { url: 'url1' };
                slaManager.register(mockExpressApp, supervisorConnection);

                expect(slaManager.reporter._app).to.be.undefined;
                expect(slaManager.reporter._connection).to.be.undefined;
            });
            it('reporter is initialized when monitorConnection parameter present', function () {
                // Reset
                slaManager.reporter._app = undefined;
                slaManager.reporter._connection = undefined;

                var supervisorConnection = { url: 'url1' };
                var monitorConnection = { url: 'url2' };
                slaManager.register(mockExpressApp, supervisorConnection, monitorConnection);

                expect(slaManager.reporter._app).to.equal(mockExpressApp);
                expect(slaManager.reporter._connection).to.equal(monitorConnection);
            });
        });
        describe('Return value', function () {
            it('should return SlaManager for chaining', function () {
                var supervisorConnection = { url: 'url' };
                var returnValue = slaManager.register(mockExpressApp, supervisorConnection);

                expect(returnValue).to.equal(slaManager);
            });
        });
    });
});