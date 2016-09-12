/* global describe, it, expect */
var chai = require('chai');
var assert = chai.assert;
var express = require('express');
var sla4oaiUIredirect = require('../../lib').sla4oaiUIredirect;

describe('sla4oaiUIredirect', function () {
    describe('#Init middleware', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                path: "/plans",
                portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
                plansURL: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
                portalURL: "http://portal.oai.governify.io/oai/#/portal"
            };

            sla4oaiUIredirect.init(express(), options);

            expect(sla4oaiUIredirect._options.path).to.equal("/plans");
            expect(sla4oaiUIredirect._options.portalSuccessRedirect).to.equal(options.portalSuccessRedirect);
            expect(sla4oaiUIredirect._options.plansURL).to.equal(options.plansURL);
            expect(sla4oaiUIredirect._options.portalURL).to.equal(options.portalURL);

        });

        it('app parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUIredirect.init();

            }, Error, "Missing parameter: app (Express)");

        });

        it('options parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUIredirect.init(express());

            }, Error, "Missing parameter: options (Object)");

        });

        it('options portalSuccessRedirect parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUIredirect.init(express(), {
                  path: "/plans",
                  plansURL: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
                  portalURL: "http://portal.oai.governify.io/oai/#/portal"
              });

            }, Error, "Missing options: options.portalSuccessRedirect (String)");

        });

        it('options plansURL parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUIredirect.init(express(), {
                  path: "/plans",
                  portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
                  portalURL: "http://portal.oai.governify.io/oai/#/portal"
              });

            }, Error, "Missing options: options.plansURL (String)");

        });

        it('options portalURL parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUIredirect.init(express(), {
                  path: "/plans",
                  portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
                  plansURL: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml"
              });

            }, Error, "Missing options: options.portalURL (String)");

        });
    });

    describe('#run middleware', function () {
        var response;
        sla4oaiUIredirect.init(express(),{
            path: "/plans",
            portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
            plansURL: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
            portalURL: "http://portal.oai.governify.io/oai/#/portal"
        });
        before(function (done) {
            chai.connect.use(sla4oaiUIredirect._middleware)
                .req(function (req) {
                })
                .end(function (res) {
                    response = res;
                    done();
                })
                .dispatch();
        });
        it('Return 300 redirect', function () {
            expect(response.statusCode).to.equal(300);
            expect(response._headers["location"]).to.equal(sla4oaiUIredirect._options.portalURL + "?plans=" +
                    sla4oaiUIredirect._options.plansURL + "&redirect=" + sla4oaiUIredirect._options.portalSuccessRedirect);
        });
    });
});
