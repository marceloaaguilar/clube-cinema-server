const axios = require('axios');
const Payment = require("../models/payment");
require('dotenv').config();

let asaasApi;

try {
  asaasApi = axios.create({
    baseURL: process.env.CLUBE_CINEMA_ASAAS_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'access_token': `$${process.env.CLUBE_CINEMA_ASAAS_API_KEY}`
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
    const {clientData, totalAmount,  creditCard, creditCardHolderInfo, paymentMethod} = bookVoucherData;

    const clientId = await getOrCreateClient(clientData);

    const paymentData = {
      customer: clientId,
      billingType: paymentMethod,
      value: totalAmount,
      dueDate: new Date(),
      description: "Clube Cinema - Vouchers"
    }
  
    const billingId = await createAsaasPayment(paymentData, clientData);
    
    let payment = await Payment.create({
      asaasId: billingId, 
      memberCPF: clientData.cpfCnpj, 
      paymentValue: paymentData.value, 
      paymentDate: new Date(), 
      paymentMethod: paymentData.billingType,
    })
    
    if (paymentMethod === "CREDIT_CARD") {
      const confirmedPayment = await confirmAsaasPayment(billingId, creditCard, creditCardHolderInfo);

      payment.status = 'paid';
      await payment.save();

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

const createAsaasPayment = async (paymentData, clientData) => {

  try {

    const response = await asaasApi.post('/payments', paymentData);
    return response.data.id;

  } catch (error) {

    const responseData = error.response?.data;

    const message =
      responseData?.message ||
      (Array.isArray(responseData?.errors) ? responseData.errors.map((e) => e.description).join('; ') : '') ||
      error.message;

    throw new Error(message);
    
  }

}

const confirmAsaasPayment = async (paymentId, creditCard, creditCardHolderInfo) => {

  const bodyRequest = {
    creditCard: creditCard,
    creditCardHolderInfo: creditCardHolderInfo
  }

  try {

    const confirmedPayment = await asaasApi.post(`/payments/${paymentId}/payWithCreditCard`, bodyRequest);
    return confirmedPayment;

  } catch (error) {

    const responseData = error.response?.data;

    const message =
      responseData?.message ||
      (Array.isArray(responseData?.errors) ? responseData.errors.map((e) => e.description).join('; ') : '') ||
      error.message;

    throw new Error(message);
  }
  
}

module.exports = {
  createCustomer,
  createAndConfirmPayment,
};
