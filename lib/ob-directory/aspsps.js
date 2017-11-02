const env = require('env-var');

const openId = env.get('OPENID_CONFIG_ENDPOINT_URL').asString();
const aspsp = (name, fapiFinancialId, openIdConfigEndpointUrl) => ({
  AuthorisationServers: [{
    AutoRegistrationSupported: true,
    BaseApiDNSUri: `http://${fapiFinancialId}.example.com`,
    ClientRegistrationUri: 'string',
    CustomerFriendlyDescription: 'string',
    CustomerFriendlyLogoUri: '',
    CustomerFriendlyName: name,
    DeveloperPortalUri: 'string',
    OpenIDConfigEndPointUri: openIdConfigEndpointUrl,
    PayloadSigningCertLocation: 'string',
    TermsOfService: 'string',
  }],
  externalId: 'string',
  id: fapiFinancialId,
});

const OBAccountPaymentServiceProviders = (req, res) => {
  res.json({
    Resources: [
      aspsp('AAA Example Bank', 'aaa-example-bank', `${openId}/aaa-example-bank`),
      aspsp('BBB Example Bank', 'bbb-example-bank', `${openId}/bbb-example-bank`),
      aspsp('CCC Example Bank', 'ccc-example-bank', `${openId}/ccc-example-bank`),
    ],
  });
};

exports.OBAccountPaymentServiceProviders = OBAccountPaymentServiceProviders;
