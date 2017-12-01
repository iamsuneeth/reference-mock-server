const assert = require('assert');
const { postPaymentSubmissionsResponse } = require('../../lib/aspsp-resource-server/payment-submissions.js');

const paymentId = '123';
const paymentSubmissionId = '456';

describe('postPaymentsResponse', () => {
  it('creates response based on request', () => {
    const status = 'AcceptedSettlementInProcess';
    const response = postPaymentSubmissionsResponse(paymentSubmissionId, paymentId, status);
    const data = response.Data;
    assert.ok(data.CreationDateTime);

    assert.equal(data.PaymentSubmissionId, paymentSubmissionId);
    assert.equal(data.PaymentId, paymentId);
    assert.equal(data.Status, status);
  });
});
