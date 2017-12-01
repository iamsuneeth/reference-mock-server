const assert = require('assert');
const { postPaymentsResponse } = require('../../lib/aspsp-resource-server/payments.js');

const risk = {};
const request = {
  Data: {
    Initiation: {
      InstructionIdentification: 'ACME412',
      EndToEndIdentification: 'FRESCO.21302.GFX.20',
      InstructedAmount: {
        Amount: '165.88',
        Currency: 'GBP',
      },
      CreditorAccount: {
        SchemeName: 'SortCodeAccountNumber',
        Identification: '08080021325698',
        Name: 'ACME Inc',
        SecondaryIdentification: '0002',
      },
    },
  },
  Risk: risk,
};

describe('postPaymentsResponse', () => {
  it('creates response based on request', () => {
    const paymentId = '123';
    const status = 'AcceptedTechnicalValidation';
    const response = postPaymentsResponse(request, paymentId, status);
    const data = response.Data;
    assert.ok(data.CreationDateTime);

    assert.equal(data.PaymentId, paymentId);
    assert.equal(data.Status, status);

    assert.deepEqual(data.Initiation, request.Data.Initiation);
    assert.deepEqual(response.Risk, risk);
  });
});
