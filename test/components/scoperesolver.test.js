/* global describe, it, expect */

var slaManager = require('../../lib');

describe('scopeResolver', function () {
    describe('#configure', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                oauthProvider: 'Google',
                oauthConfig: {
                    clientId: '6076-d1m.apps.googleusercontent.com',
                    clientSecret: '1lWx9DDDaPo9kxF4yu6t_loJ',
                    callbackURL: 'https://app.myservice.com/google/callback'
                }
            };

            slaManager.scopeResolver.configure(options);

            expect(slaManager.scopeResolver._oauthProvider).to.equal(options.oauthProvider);
            expect(slaManager.scopeResolver._oauthConfig).to.equal(options.oauthConfig);
        });
    });
});