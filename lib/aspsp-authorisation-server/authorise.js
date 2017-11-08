/**
 * a VERY Basic Authorization server functionality to authorize TPP against ASPSP
 * and provide authorization code for TPP to interact with ASPSP
 * If correct is expected redirection request with authorization code
 * to be returned user agent
 * If incorrect is expected redirection request with error flat or bad request
 * to be returned user agent
 */
const log = require('debug')('log');
const env = require('env-var');

const ValidationException = require('../errors/ValidationException');
const RedirectionException = require('../errors/RedirectionException');

const AUTHORISE_SCOPE = 'openid accounts';
const AUTHORISE_RESPONSE_TYPE = 'code';

const INVALID_REQUEST = 'invalid_request';
const UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type';
const INVALID_SCOPE = 'invalid_scope';

const tempAuthorizationCode = env.get('AUTHORISATION_CODE').asString();

const validateAuthorisationParams = (query) => {
  const redirectionParams = {};
  if (query.state) {
    redirectionParams.state = query.state;
  }
  if (!query || !query.redirect_url || !query.clientId) {
    throw new ValidationException();
  }

  if (!query.request || !query.response_type) {
    redirectionParams.error = INVALID_REQUEST;
    throw new RedirectionException(query.redirect_url, redirectionParams);
  }
  if (!!query.response_type && query.response_type !== AUTHORISE_RESPONSE_TYPE) {
    redirectionParams.error = UNSUPPORTED_RESPONSE_TYPE;
    throw new RedirectionException(query.redirect_url, redirectionParams);
  }
  if (!!query.scope && query.scope !== AUTHORISE_SCOPE) {
    redirectionParams.error = INVALID_SCOPE;
    throw new RedirectionException(query.redirect_url, redirectionParams);
  }
};

const generateAuthorisationCode = () => {
  log('Generate Authorization_Code');
  return tempAuthorizationCode;
};

const authorise = (req, res) => {
  validateAuthorisationParams(req.query);

  const { query } = req;
  const { redirect_url: redirectUrl } = query;
  const { clientId, state, request: signedJWTrequest } = query;

  log(`Validate clientId [${clientId}] & scope`);

  log(`Validate redirect-url client [${redirectUrl}]`);

  log(`Validate JWT requrest claim [${signedJWTrequest}]`);

  const authorizationCode = generateAuthorisationCode();

  const stateRedirectionValue = state ? `&state=${state}` : '';
  const aspspCallbackRedirectionUrl = `${redirectUrl}?code=${authorizationCode}${stateRedirectionValue}`;
  res.redirect(302, aspspCallbackRedirectionUrl);
};

exports.authorise = authorise;
