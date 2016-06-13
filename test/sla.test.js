/* global describe, it, expect */

var sla = require('..');
var mockExpressApp = {
    use: function () { }
};
describe('sla', function () {
    describe('#register', function () {
        describe('Validate parameters', function () {
            it('should throw if lacking express app parameter', function () {
                expect(function () {
                    sla.register();
                }).to.throw(Error, 'Missing parameter: app (Express)');
            });
            it('should throw if lacking supervisorConnection parameter', function () {
                expect(function () {
                    sla.register(mockExpressApp);
                }).to.throw(Error, 'Missing parameter: supervisorConnection (Object)');
            });
            it('should throw if missing url in supervisorConnection parameter', function () {
                expect(function () {
                    var supervisorConnection = {};
                    sla.register(mockExpressApp, supervisorConnection);
                }).to.throw(Error, 'Invalid supervisorConnection, missing url property');
            });
            it('should throw if missing url in monitorConnection parameter', function () {
                expect(function () {
                    var supervisorConnection = { url: 'url' };
                    var monitorConnection = {};
                    sla.register(mockExpressApp, supervisorConnection, monitorConnection);
                }).to.throw(Error, 'Invalid monitorConnection, missing url property');
            });
        });

        describe('Components initialization', function () {
            it('scopeResolver is initialized', function () {
                // Reset
                sla.scopeResolver._app = undefined;
                sla.scopeResolver._connection = undefined;

                var supervisorConnection = { url: 'url' };
                sla.register(mockExpressApp, supervisorConnection);

                expect(sla.scopeResolver._app).to.equal(mockExpressApp);
                expect(sla.scopeResolver._connection).to.equal(supervisorConnection);
            });
            it('bouncer is initialized', function () {
                // Reset
                sla.bouncer._app = undefined;
                sla.bouncer._connection = undefined;

                var supervisorConnection = { url: 'url' };
                sla.register(mockExpressApp, supervisorConnection);

                expect(sla.bouncer._app).to.equal(mockExpressApp);
                expect(sla.bouncer._connection).to.equal(supervisorConnection);
            });
            it('reporter is not initialized when monitorConnection parameter missing', function () {
                // Reset
                sla.reporter._app = undefined;
                sla.reporter._connection = undefined;

                var supervisorConnection = { url: 'url1' };
                sla.register(mockExpressApp, supervisorConnection);

                expect(sla.reporter._app).to.be.undefined;
                expect(sla.reporter._connection).to.be.undefined;
            });
            it('reporter is initialized when monitorConnection parameter present', function () {
                // Reset
                sla.reporter._app = undefined;
                sla.reporter._connection = undefined;

                var supervisorConnection = { url: 'url1' };
                var monitorConnection = { url: 'url2' };
                sla.register(mockExpressApp, supervisorConnection, monitorConnection);

                expect(sla.reporter._app).to.equal(mockExpressApp);
                expect(sla.reporter._connection).to.equal(monitorConnection);
            });
        });
        describe('Return value', function () {
            it('should return sla for chaining', function () {
                var supervisorConnection = { url: 'url' };
                var returnValue = sla.register(mockExpressApp, supervisorConnection);

                expect(returnValue).to.equal(sla);
            });
        });
    });
});