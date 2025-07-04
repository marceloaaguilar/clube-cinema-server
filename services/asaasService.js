const axios = require('axios');
const Payment = require("../models/payment");
require('dotenv').config();

let asaasApi;

try {
  asaasApi = axios.create({
    baseURL: process.env.ASAAS_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'access_token': `$${process.env.ASAAS_API_KEY}==`
    },
  });

} catch (error) {
  throw new Error('Erro ao abrir conexão com o Asaas: ' + error.message);
}


const createCustomer = async (clientData) => {
  try {

    const response = await asaasApi.post('/customers', clientData);
    return response.data;

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw new Error('Falha ao criar cliente');
  }
};

const createAndConfirmPayment = async (bookVoucherData) => {
  try {
    const {clientData, paymentValue, voucherId, creditCard, creditCardHolderInfo, paymentMethod} = bookVoucherData;

    const clientId = await getOrCreateClient(clientData);

    const paymentData = {
      customer: clientId,
      billingType: paymentMethod,
      value: paymentValue,
      dueDate: new Date(),
      description: "Clube Cinema - Voucher: " + voucherId
    }

    const payment = await createPayment(paymentData, clientData);

    if (paymentMethod === "CREDIT_CARD") {
      const confirmedPayment = await confirmPayment(payment?.id, creditCard, creditCardHolderInfo);
      return confirmedPayment;
    }

    return payment;

  } catch (error) {
    throw new Error('Falha ao criar pagamento: ' + error.message);
  }
};

const getCustomerByCpfCnpj = async (cpfCnpj) => {

  try {
    const response = await asaasApi.get('/customers', {
      params: { cpfCnpj}
    });

    return response.data;

  } catch (error) {
    console.error('Erro ao buscar o cliente:', error);
  }
  

};

const getOrCreateClient = async (clientData) => {

  const clientExists = await getCustomerByCpfCnpj(clientData?.cpfCnpj);

  if (!clientExists || (clientExists.totalCount === 0 ) ) {
    const createdClient = await createCustomer(clientData);
    return createdClient.id;
  }

  return clientExists.data[0].id;
}

const createPayment = async (paymentData, clientData) => {
  try {

    const response = await asaasApi.post('/payments', paymentData);

    if (response?.data) {
      const responseData = response?.data;

      const payment = await Payment.create({
        asaasId: responseData.id, 
        memberCPF: clientData.cpfCnpj, 
        paymentValue: paymentData.value, 
        paymentDate: new Date(), 
        paymentMethod: paymentData.billingType
      });

      return response?.data;
    }

  } catch (error) {
    throw new Error(error.message);
  }

}

const confirmPayment = async (paymentId, creditCard, creditCardHolderInfo) => {

  const bodyRequest = {
    creditCard: creditCard,
    creditCardHolderInfo: creditCardHolderInfo
  }

  try {

    const confirmedPayment = await asaasApi.post(`/payments/${paymentId}/payWithCreditCard`, bodyRequest);
    return confirmedPayment;

  } catch (error) {
    throw new Error('Erro ao confirmar pagamento: ' + error.message);
  }
  
}


module.exports = {
  createCustomer,
  createAndConfirmPayment,
};
