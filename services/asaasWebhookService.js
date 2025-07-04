const Payment = require("../models/payment");
const Voucher = require("../models/voucher");

const processPaymentReceived = async (payment) => {

  const { id: paymentId, customer: customerId, value: paymentValue, paymentDate } = payment;

  const paymentData = Payment.findOne({where: {asaasId: paymentId}});
  if (!paymentData) return res.status(400).send('Pagamento não encontrado!');

  paymentData.status = 'paid';
  await paymentData.save();
 
};

module.exports = {processPaymentReceived};
