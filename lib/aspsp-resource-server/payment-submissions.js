const postPaymentSubmissionsResponse = (paymentSubmissionId, paymentId, status) => ({
  Data: {
    PaymentSubmissionId: paymentSubmissionId,
    PaymentId: paymentId,
    Status: status,
    CreationDateTime: `${(new Date()).toISOString().slice(0, -5)}+00:00`,
  },
  Links: {
    Self: `/open-banking/v1.1/payment-submissions/${paymentSubmissionId}`,
  },
  Meta: {},
});

exports.postPaymentSubmissionsResponse = postPaymentSubmissionsResponse;
