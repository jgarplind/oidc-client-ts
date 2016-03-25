import OidcClientService from '../src/OidcClientService';
import SigninRequest from '../src/SigninRequest';
import SignoutRequest from '../src/SignoutRequest';
import Log from '../src/Log';

import StubMetadataService from './StubMetadataService';

import chai from 'chai';
chai.should();
let assert = chai.assert;

describe("OidcClientService", function() {
    let settings;
    let subject;
    let stubMetadataService;

    beforeEach(function() {
        Log.setLogger(console);
        Log.level = Log.NONE;

        settings = {
            client_id: 'client',
            redirect_uri: "http://app"
        };
        stubMetadataService = new StubMetadataService();
        subject = new OidcClientService(settings, () => stubMetadataService);
    });

    describe("constructor", function() {
        it("should require a settings param", function() {
            try {
                new OidcClientService();
            }
            catch (e) {
                e.message.should.contain('settings');
                return;
            }
            assert.fail();
        });

    });

    describe("createSigninRequest", function() {

        it("should return a promise", function() {
            stubMetadataService.getAuthorizationEndpointResult = Promise.resolve("http://sts/authorize");
            subject.createSigninRequest().should.be.instanceof(Promise);
        });

        it("should return SigninRequest", function(done) {
            stubMetadataService.getAuthorizationEndpointResult = Promise.resolve("http://sts/authorize");

            var p = subject.createSigninRequest();

            p.then(request => {
                request.should.be.instanceof(SigninRequest);
                done();
            });
        });

        it("should pass params to SigninRequest", function(done) {
            stubMetadataService.getAuthorizationEndpointResult = Promise.resolve("http://sts/authorize");

            var p = subject.createSigninRequest({
                state: 'foo',
                response_type: 'bar',
                scope: 'baz',
                redirect_uri: 'quux'
            });

            p.then(request => {
                request.state.data.should.equal('foo');
                
                var url = request.signinUrl;
                url.should.contain("http://sts/authorize");
                url.should.contain("response_type=bar");
                url.should.contain("scope=baz");
                url.should.contain("redirect_uri=quux");
                done();
            });
        });

        it("should fail if metadata fails", function(done) {
            stubMetadataService.getAuthorizationEndpointResult = Promise.reject("test");

            var p = subject.createSigninRequest();

            p.then(null, err => {
                err.message.should.contain("signin");
                done();
            });
        });

    });

    describe("createSignoutRequest", function() {

        it("should return a promise", function() {
            stubMetadataService.getEndSessionEndpointResult = Promise.resolve("http://sts/signout");
            subject.createSignoutRequest().should.be.instanceof(Promise);
        });

        it("should return SignoutRequest", function(done) {
            stubMetadataService.getEndSessionEndpointResult = Promise.resolve("http://sts/signout");

            var p = subject.createSignoutRequest();

            p.then(request => {
                request.should.be.instanceof(SignoutRequest);
                done();
            });
        });

        it("should pass params to SignoutRequest", function(done) {
            stubMetadataService.getEndSessionEndpointResult = Promise.resolve("http://sts/signout");

            var p = subject.createSignoutRequest({
                state: 'foo',
                post_logout_redirect_uri: "bar",
                id_token_hint: "baz"
            });

            p.then(request => {
                request.state.data.should.equal('foo');
                var url = request.signoutUrl;
                url.should.contain("http://sts/signout");
                url.should.contain("post_logout_redirect_uri=bar");
                url.should.contain("id_token_hint=baz");
                done();
            });
        });

        it("should fail if metadata fails", function(done) {
            stubMetadataService.getEndSessionEndpointResult = Promise.reject("test");

            var p = subject.createSignoutRequest();

            p.then(null, err => {
                err.message.should.contain("signout");
                done();
            });
        });

    });
});