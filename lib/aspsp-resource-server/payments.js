const { accountRequestHelper } = require('./account-request.js');

const postPaymentsResponse = (request, paymentId, status) => ({
  Data: {
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
    Initiation: request.Data.Initiation,
  },
  Risk: request.Data.Risk,
  Links: {
    Self: `/open-banking/v1.1/payments/${paymentId}`,
  },
  Meta: {},
});

exports.postPaymentsResponse = postPaymentsResponse;
