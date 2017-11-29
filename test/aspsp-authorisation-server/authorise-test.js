const assert = require('assert');
const request = require('supertest'); // eslint-disable-line
const httpMocks = require('node-mocks-http');

const proxyquire = require('proxyquire');
const env = require('env-var');

describe('/authorize endpoint test', () => {
  let authoriseService;
  const state = '123456';
  const aspspCallbackRedirectionUrl = 'http://example.com/aaa-bank-url';
  const authorsationCode = 'ABCD123456789';

  const refQuery = {
    redirect_uri: aspspCallbackRedirectionUrl,
    state,
    client_id: 'ABC',
    response_type: 'code',
    request: 'jwttoken',
    scope: 'openid accounts',
  };

  before(() => {
    process.env.AUTHORISATION_CODE = authorsationCode;
    authoriseService = proxyquire('../../lib/aspsp-authorisation-server/authorise', {
      'env-var': env.mock({
        AUTHORISATION_CODE: authorsationCode,
      }),
    });
  });


  it('Validate successful ASPSP AS authorisation for account flow ', () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery);
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    authorise(req, res);
    assert.equal(res.statusCode, 302);
    const location = res._getRedirectUrl();  //eslint-disable-line
    assert.ok(location);
    assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
    assert.ok(location.includes(`code=${authorsationCode}`));
    assert.ok(location.includes(`state=${state}`));
  });

  it('Validate successful ASPSP AS authorisation for payment flow ', () => {
    const { authorise } = authoriseService;
    const query = Object.assign({}, refQuery, { scope: 'openid payments' });
    const req = httpMocks.createRequest({
      method: 'GET',
      url: '/aaa-bank/authorize',
      query,
    });
    const res = httpMocks.createResponse();
    authorise(req, res);
    assert.equal(res.statusCode, 302);
    const location = res._getRedirectUrl();  //eslint-disable-line
    assert.ok(location);
    assert.ok(location.startsWith(aspspCallbackRedirectionUrl));
    assert.ok(location.includes(`code=${authorsationCode}`));
    assert.ok(location.includes(`state=${state}`));
  });
});
