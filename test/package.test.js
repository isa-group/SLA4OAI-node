/* global describe, it, expect */

var slaManager = require('..');

describe('sla4oai package', function () {
    it('should expose singleton slaManager', function () {
        expect(slaManager).to.be.an('object');
    });
    it('SlaManager should expose "scopeResolver"', function () {
        expect(slaManager.scopeResolver).to.be.an('object');
    });
    it('SlaManager should expose "bouncer"', function () {
        expect(slaManager.bouncer).to.be.an('object');
    });
    it('SlaManager should expose "reporter"', function () {
        expect(slaManager.reporter).to.be.an('object');
    });
    it('SlaManager should expose "sla4oaiUI"', function () {
        expect(slaManager.sla4oaiUI).to.be.an('object');
    });
});
