/**
 * A VERY Basic Authorization server which compares client_id and client_secret
 * (hard coded - see .env.sample file for values) to what is expected.
 * If credentials match then an auth token is returned.
 */
const log = require('debug')('log');
const AuthenticationException = require('../errors/AuthenticationException')

const ONE_HOUR = 3600;
const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_CLINET_CREDENTIALS = 'client_credentials';

const ERROR_INVALID_REQUEST = 'invalid_request';
const ERROR_INVALID_CLIENT = 'invalid_client';



const clientCredentials = () => ({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

/**
 * Stupidly simple function to make access token
 */
const makeAccessToken = () => process.env.ACCESS_TOKEN || '';

/*
 * Use Basic Authentication Scheme: https://tools.ietf.org/html/rfc2617#section-2
 */
const credentials = (id, secret) => {
  const basicCredentials = Buffer.from(`${id}:${secret}`).toString('base64');
  return `Basic ${basicCredentials}`;
};

/**
 * @description Very simple auth function to check the grant type and credentials
 * @param grantType
 * @param authorization
 */
const ValidationException = require('../errors/ValidationException');

const authenticate = (grantType, authorization) => {
  const { clientId, clientSecret } = clientCredentials();
  const expectedCredentials = credentials(clientId, clientSecret);
  if (authorization !== expectedCredentials
    || (grantType !== GRANT_CLINET_CREDENTIALS && grantType !== GRANT_AUTHORIZATION_CODE)) {
    throw (new AuthenticationException()).addPayload({ error: ERROR_INVALID_CLIENT }).addHeader('WWW-Authenticate', grantType);
  }
};

const checkParamsPresent = (scope, grantType, authorization) => {
  if (!scope) {
    throw (new ValidationException('scope missing from request body')).setPayload({ error: ERROR_INVALID_REQUEST });
  }
  if (!grantType) {
    throw (new ValidationException('grant_type missing from request body')).setPayload({ error: ERROR_INVALID_REQUEST });
  }
  if (!authorization) {
    throw (new ValidationException('authorization missing from request headers')).setPayload({ error: ERROR_INVALID_CLIENT });
  }
};

const createToken = (req, res) => {
  const grantType = req.body.grant_type;
  const { scope } = req.body;
  const { 'code': authorizationCode } = req.body;
  const { authorization } = req.headers;

  res.set('Content-Type', 'application/json; charset=UTF-8');
  checkParamsPresent(scope, grantType, authorization);

  authenticate(grantType, authorization);
  // Successful Response see: https://tools.ietf.org/html/rfc6749#section-5.1
  const accessToken = makeAccessToken();
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-store');
  return res.json({
    access_token: accessToken,
    expires_in: ONE_HOUR,
    token_type: 'bearer',
    scope,
  });
};

exports.credentials = credentials;
exports.createToken = createToken;
