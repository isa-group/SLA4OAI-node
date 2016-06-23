/* global describe, it, expect */

var slaManager = require('../../lib');

describe('reporter', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                autoReport: true,
                aggregate: true,
                aggregationPeriod: 100,
                cluster: 'cl1.acme.com',
                environment: 'qa'
            };

            slaManager.reporter.configure(options);

            expect(slaManager.reporter._autoReport).to.equal(options.autoReport);
            expect(slaManager.reporter._aggregate).to.equal(options.aggregate);
            expect(slaManager.reporter._aggregationPeriod).to.equal(options.aggregationPeriod);
            expect(slaManager.reporter._cluster).to.equal(options.cluster);
            expect(slaManager.reporter._environment).to.equal(options.environment);
        });
    });
});