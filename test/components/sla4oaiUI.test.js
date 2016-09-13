/* global describe, it, expect */
var chai = require('chai');
var assert = chai.assert;
var express = require('express');
var sla4oaiUI = require('../../lib').sla4oaiUI;

describe('sla4oaiUI', function () {
    describe('#Init middleware', function () {
        it('options parameter is parsed correctly', function () {
            var options = {
                path: "/plans",
                portalSuccessRedirect: "/docs",
                url: __dirname + "/../sampleServer/petstore-plans.yaml",
                portalURL: "http://portal.oai.governify.io/oai/#/portal"
            };

            sla4oaiUI.init(express(), options);

            expect(sla4oaiUI._options.path).to.equal("/plans");
            expect(sla4oaiUI._options.portalSuccessRedirect).to.equal("/docs");
            expect(sla4oaiUI._options.url).to.equal(options.url);
            expect(sla4oaiUI._options.portalURL).to.equal(options.portalURL);

        });

        it('app parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUI.init();

            }, Error, "Missing parameter: app (Express)");

        });

        it('options parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUI.init(express());

            }, Error, "Missing parameter: options (Object)");

        });

        it('options url parameter is not parsed', function () {

            assert.throw( () => {

              sla4oaiUI.init(express(), {
                  path: "/plans",
                  portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
                  portalURL: "http://portal.oai.governify.io/oai/#/portal"
              });

            }, Error, "Missing options: options.url (String)");

        });

    });

    describe('#run middleware', function () {
        var response;
        sla4oaiUI.init(express(),{
            path: "/plans",
            portalSuccessRedirect: "http://petstore.services.oai.governify.io/pets",
            url: "http://petstore.services.oai.governify.io/statics/plans/plans.yaml",
            portalURL: "http://portal.oai.governify.io/oai/#/portal"
        });
        before(function (done) {
            chai.connect.use(sla4oaiUI._middleware)
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
            expect(response._headers["location"]).to.equal(sla4oaiUI._options.portalURL + "?plans=" +
                    sla4oaiUI._options.url + "&redirect=" + sla4oaiUI._options.portalSuccessRedirect);
        });
    });
});
