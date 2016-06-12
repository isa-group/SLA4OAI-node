/* global describe, it, expect */

var sla = require('..');

describe('sla', function () {
    it('should expose singleton sla', function () {
        expect(sla).to.be.an('object');
    });
    it('sla should expose "scopeResolver"', function () {
        expect(sla.scopeResolver).to.be.an('object');
    });
    it('sla should expose "bouncer"', function () {
        expect(sla.bouncer).to.be.an('object');
    });
    it('sla should expose "reporter"', function () {
        expect(sla.reporter).to.be.an('object');
    });
});