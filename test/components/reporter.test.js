/* global describe, it, expect */

var sla = require('../../lib');

describe('reporter', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                autoReport: true,
                aggregate: true,
                aggregationPeriod: 100,
                autoPopulatedMetrics: ['ResponseTime', 'RequestHeaders'],
                cluster: 'cl1.acme.com',
                environment: 'qa'
            };

            sla.reporter.configure(options);

            expect(sla.reporter._autoReport).to.equal(options.autoReport);
            expect(sla.reporter._aggregate).to.equal(options.aggregate);
            expect(sla.reporter._aggregationPeriod).to.equal(options.aggregationPeriod);
            expect(sla.reporter._autoPopulatedMetrics).to.equal(options.autoPopulatedMetrics);
            expect(sla.reporter._cluster).to.equal(options.cluster);
            expect(sla.reporter._environment).to.equal(options.environment);
        });
    });
});