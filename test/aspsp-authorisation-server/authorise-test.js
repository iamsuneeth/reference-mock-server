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

  it('validate ASPSP redirection uri params for account request flow and code/state in response header', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&client_id=ABC&response_type=code&request=jwttoken&scope=openid accounts`)
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

  it('validate ASPSP redirection uri params for payments request flow and code/state in response header', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&client_id=ABC&response_type=code&request=jwttoken&scope=openid payments`)
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

  it('validate if is not provided in response when not defined in ASPSP redirection uri', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&client_id=ABC&response_type=code&request=jwttoken`)
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

  it('returns BAD REQUEST when redirection_uri is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?state=${state}&client_id=ABC&response_type=code&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 400);
        done();
      });
  });

  it('returns BAD REQUEST when client_id is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=code&request=jwttoken`)
      .end((err, res) => {
        assert.equal(res.status, 400);
        done();
      });
  });

  it('redirects with 302 (FOUND), state and error flag invalid request when response_type is not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&client_id=ABC&request=jwttoken`)
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
  it('redirects with 302 (FOUND), "invalid_request" error when response_type and state are not provided', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&client_id=ABC&request=jwttoken`)
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
  it('redirects with 302 (FOUND), state and "unsupported_response_type" error when response_type is not supported', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=not-supported&client_id=ABC&request=jwttoken`)
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
  it('redirects with 302 (FOUND), state and "invalid_scope" error when scope is defined but not supported', (done) => {
    request(server.app)
      .get(`/aaa-bank/authorize?redirect_uri=${aspspCallbackRedirectionUrl}&state=${state}&response_type=code&client_id=ABC&request=jwttoken&scope=not-supported`)
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
