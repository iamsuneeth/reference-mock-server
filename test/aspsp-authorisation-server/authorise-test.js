const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const proxyquire = require('proxyquire');
const env = require('env-var');

describe('/authorize endpoint test', () => {
  let server;
  let authorisationService;
  let authoriseEndpoint;
  const state = '123456';
  const aspspCallbackRedirectionUrl = 'http://example.com/aaa-bank-url';
  const authorsationCode = 'ABCD123456789';

  before(() => {
    authoriseEndpoint = proxyquire('../../lib/aspsp-authorisation-server/authorise', {
      'env-var': env.mock({
        AUTHORISATION_CODE: authorsationCode,
      }),
    });

    authorisationService = proxyquire('../../lib/aspsp-authorisation-server', {
      './authorise': authoriseEndpoint,
    });

    server = proxyquire('../../lib/app.js', {
      './aspsp-authorisation-server': authorisationService,
    });
  });

  it('request authorisation code and validate other redirection params (all optional parameters provided)', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&clientId=ABC&response_type=code&request=jwttoken&scope=openid accounts`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(location.includes(`code=${authorsationCode}`));
        assert.ok(location.includes(`state=${state}`));
        done();
      });
  });

  it('request authorisation code and validate other redirection params (none of optional parameters provided)', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&clientId=ABC&response_type=code&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(location.includes('?code'));
        assert.ok(!location.includes('state'));
        done();
      });
  });

  it('returns BAD REQUEST when redirection_url is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?state=${state}&clientId=ABC&response_type=code&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 400);
        done();
      });
  });

  it('returns BAD REQUEST when clientId is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=code&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 400);
        done();
      });
  });

  it('redirects with 302 (FOUND), state and error flag invalid request when response_type is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&clientId=ABC&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(!location.includes('code'));
        assert.ok(location.includes(`state=${state}`));
        assert.ok(location.includes('error=invalid_request'));
        done();
      });
  });
  it('redirects with 302 (FOUND), error flag invalid request when response_type is not provided and not state', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&clientId=ABC&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(!location.includes('code'));
        assert.ok(!location.includes('state'));
        assert.ok(location.includes('error=invalid_request'));
        done();
      });
  });
  it('redirects with 302 (FOUND), state and error flag unsupported_response_type when response_type is not supported', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=not-supported&clientId=ABC&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(!location.includes('code'));
        assert.ok(location.includes(`state=${state}`));
        assert.ok(location.includes('error=unsupported_response_type'));
        done();
      });
  });
  it('redirects with 302 (FOUND), state and error flag invalid_scope when scope is defined but not supported', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=code&clientId=ABC&request=jwttoken&scope=not-supported`)
      .end((err, res) => {
        assert.equal(res.status, 302);
        assert.strictEqual(res.redirect, true);
        const { location } = res.header;
        assert.ok(location);
        assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
        assert.ok(!location.includes('code'));
        assert.ok(location.includes(`state=${state}`));
        assert.ok(location.includes('error=invalid_scope'));
        done();
      });
  });
});
