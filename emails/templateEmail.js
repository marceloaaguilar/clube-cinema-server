function generateVoucherEmail({ customerName, orderNumber, reservationDate, totalAmount, codes }) {
  const listaDeVouchers = codes
    .map((v) => `<li style="margin-bottom: 6px; font-size: 16px;">🔖 <strong>${v.barCode}</strong></li>`)
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirmação de Compra</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #8033cc;
          color: #ffffff;
          text-align: center;
          padding: 30px 20px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .content h2 {
          color: #8033cc;
          font-size: 20px;
          margin-top: 0;
        }
        .voucher-box {
          background-color: #f0e9fa;
          border-left: 5px solid #8033cc;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 6px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #888888;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Compra Confirmada!</h1>
        </div>
        <div class="content">
          <h2>Olá, ${customerName}!</h2>
          <p>Recebemos sua compra e aqui estão os detalhes do seu pedido:</p>

          <div class="voucher-box">
            <p><strong>Nº do Pedido:</strong> ${orderNumber}</p>
            <p><strong>Data:</strong> ${reservationDate}</p>
            <p><strong>Total:</strong> R$ ${totalAmount}</p>
            <p style="margin-top: 12px;"><strong>Vouchers:</strong></p>
            <ul style="list-style: none; padding-left: 0;">
              ${listaDeVouchers}
            </ul>
          </div>

          <p>Use os códigos acima conforme as instruções. Qualquer dúvida, fale com a gente!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sua Empresa.
        </div>
      </div>
    </body>
    </html>
  `
}

module.exports = generateVoucherEmail
