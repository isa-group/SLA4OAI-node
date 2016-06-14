/* global describe, it, expect */

var slaManager = require('../../lib');

describe('scopeResolver', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                oauthProvider: 'Google'
            };

            slaManager.scopeResolver.configure(options);

            expect(slaManager.scopeResolver._oauthProvider).to.equal(options.oauthProvider);
        });
    });
});