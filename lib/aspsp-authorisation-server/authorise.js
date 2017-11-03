/**
 * a VERY Basic Authorization server functionality to authorize TPP against ASPSP
 * and provide authorization code for TPP to interact with ASPSP
 * If correct is expected redirection request with authorization code
 * to be returned user agent
 * If incorrect is expected redirection request with error flat or bad request
 * to be returned user agent
 */
const log = require('debug')('log');
const uuidv4 = require('uuid/v4');

const ValidationException = require('../errors/ValidationException');
const RedirectionException = require('../errors/RedirectionException');

const AUTHORISE_SCOPE = 'openid accounts';
const AUTHORISE_RESPONSE_TYPE = 'code';

const validateAuthirisationParams = async (query) => {
  const redirectionErrors = {};
  if (query.state) {
    redirectionErrors.state = query.state;
  }
  if (!query || !query.redirect_url || !query.clientId) {
    throw new ValidationException();
  }

  if (!query.request || !query.response_type) {
    redirectionErrors.error = 'invalid_request';
    throw new RedirectionException(query.redirect_url, redirectionErrors);
  }
  if (!!query.response_type && query.response_type !== AUTHORISE_RESPONSE_TYPE) {
    redirectionErrors.error = 'unsupported_response_type';
    throw new RedirectionException(query.redirect_url, redirectionErrors);
  }
  if (!!query.scope && query.scope !== AUTHORISE_SCOPE) {
    redirectionErrors.error = 'invalid_scope';
    throw new RedirectionException(query.redirect_url, redirectionErrors);
  }
};

const generateAuthorisationCode = async () => {
  log('Generate Authorization_Code');
  return uuidv4();
};

const authorise = async (req, res) => {
  await validateAuthirisationParams(req.query);

  const { query } = req;
  const { redirect_url: redirectUrl } = query;
  const { clientId, state, request: signedJWTrequest } = query;

  log(`Validate clientId [${clientId}] & scope`);

  log(`Validate redirect-url client [${redirectUrl}]`);

  log(`Validate JWT requrest claim [${signedJWTrequest}]`);

  const authorizationCode = await generateAuthorisationCode();

  const stateRedirectionValue = state ? `&state=${state}` : '';
  const aspspCallbackRedirectionUrl = `${redirectUrl}?authorization-code=${authorizationCode}${stateRedirectionValue}`;
  res.redirect(302, aspspCallbackRedirectionUrl);
};

exports.authorise = authorise;
