/* global describe, it, expect */

var slaManager = require('../../lib');

describe('bouncer', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                environment: 'qa'
            };

            slaManager.bouncer.configure(options);

            expect(slaManager.bouncer._environment).to.equal(options.environment);
        });
    });
});