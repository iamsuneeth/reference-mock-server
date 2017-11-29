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
const { validate } = require('./validate');

const tempAuthorizationCode = env.get('AUTHORISATION_CODE').asString();


const generateAuthorisationCode = () => {
  log('Generate Authorization_Code');
  return tempAuthorizationCode;
};

const authorise = (req, res) => {
  validate(req.query);

  const { query } = req;
  const { redirect_uri: redirectUri } = query;
  const { client_id: clientId } = query;
  const { state, request: signedJWTrequest } = query;

  log(`Validate clientId [${clientId}] & scope`);

  log(`Validate redirect-uri client [${redirectUri}]`);

  log(`Validate JWT requrest claim [${signedJWTrequest}]`);

  const authorizationCode = generateAuthorisationCode();

  const stateRedirectionValue = state ? `&state=${state}` : '';
  const aspspCallbackRedirectionUrl = `${redirectUri}?code=${authorizationCode}${stateRedirectionValue}`;
  log(`Redirection back uri ${aspspCallbackRedirectionUrl}`);
  res.redirect(302, aspspCallbackRedirectionUrl);
};

exports.authorise = authorise;
