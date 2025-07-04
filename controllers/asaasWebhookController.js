const asaasWebhookService = require('../services/asaasWebhookService');

exports.handleWebhook = async (req, res) => {
  try {
    const { event, payment } = req.body;

    if (!event || !payment) {
      return res.status(400).send('Formato inválido');
    }

    if (event === 'PAYMENT_RECEIVED' && payment.status === 'RECEIVED') {
      await asaasWebhookService.processPaymentReceived(payment);
      return res.status(200).send('Pagamento processado');
    }

    // Ignorar outros eventos
    return res.status(200).send('Evento ignorado');
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return res.status(500).send('Erro interno');
  }
};
