require('dotenv').config();

const nodemailer = require('nodemailer');
const generateVoucherEmail = require('../emails/templateEmail');

async function sendMailWithVouchers(order, codes) {

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465, 
    secure: true, 
    auth: {
      user: process.env.CLUBE_CINEMA_EMAIL_USER, 
      pass: process.env.CLUBE_CINEMA_EMAIL_PASSWORD,   
    },
  });

  const {customerName, customerEmail, orderNumber, totalAmount} = order;
  const reservationDate = new Date().toLocaleDateString('pt-BR');

  const html = generateVoucherEmail({
    customerName,
    orderNumber,
    reservationDate,
    totalAmount,
    codes: codes, 
  });

  const mailOptions = {
    from: 'naoresponda@multimp.com.br',
    to: customerEmail,
    subject: 'Confirmação de Compra - Vouchers',
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

module.exports = sendMailWithVouchers;
