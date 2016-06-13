/* global describe, it, expect */

var sla = require('../../lib');

describe('bouncer', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                environment: 'qa'
            };

            sla.bouncer.configure(options);

            expect(sla.bouncer._environment).to.equal(options.environment);
        });
    });
});