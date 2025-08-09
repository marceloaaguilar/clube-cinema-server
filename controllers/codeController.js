const catchAsync = require("../utils/catchAsync");

const Code = require("../models/code");
const Order = require("../models/order");
const Voucher = require("../models/voucher");
const VoucherReservationHistory = require("../models/voucherReservationHistory");

const sendMailWithVouchers = require('../services/sendEmail.js');


exports.createCodes = catchAsync(async (req, res) => {
  
  try {
    const codes = req.body;
    let vouchersToUpdate = {};

    for (const [index, code] of (codes || []).entries()) {

      if (!code.voucherId) {
        return res.status(400).json({ error: `Não foi informado o ID do voucher! Linha: ${index}` });
      }

      if (!code.sequential) {
        return res.status(400).json({ error: `Não foi informado o sequencial do código! Linha: ${index}` });
      }

      if (!code.shippingBatch) {
        return res.status(400).json({ error: `Não foi informado o lote de envio do código! Sequencial: ${code.sequential}` });
      }

      if (!code.barCode) {
        return res.status(400).json({ error: `Não foi informado o código de barras! Sequencial: ${code.sequential}` });
      }

      if (!code.expirationDate) {
        return res.status(400).json({ error: `Não foi informada a data de validade do código! Sequencial: ${code.sequential}` });
      }

      const codeExists = await Code.findOne({ where: { barCode: code.barCode } });
      if (codeExists) {
        return res.status(400).json({ error: `Já existe um código cadastrado com este código de barras: ${code.barCode}` });
      }

      vouchersToUpdate[[code.voucherId]] = (vouchersToUpdate[[code.voucherId]] || 0) + 1;
    }

    if (!codes || codes.length === 0) {
      return res.status(400).json({ error: "Não existem códigos para cadastrar!" });
    }

    const createdCodes = await Code.bulkCreate(codes);
    if (!createdCodes || createdCodes.length === 0) {
      return res.status(400).json({ error: "Ocorreu um erro durante o cadastro dos códigos!" });
    }

    for (const voucherId of Object.keys(vouchersToUpdate)) {
      let voucherData = await Voucher.findByPk(voucherId);

      if (voucherData) {
        const newQuantity = voucherData.availableQuantity + vouchersToUpdate[voucherId];
        await voucherData.update({ availableQuantity: newQuantity });
        await voucherData.save();
      }

    }
    
    return res.status(201).json({ success: 'Os códigos foram cadastrados com sucesso!' });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

exports.getCodesByVoucherId = catchAsync(async(req, res) => {
  try {

    const { voucherId } = req.params;

    if (!voucherId) return res.status(400).json({ error: 'Não foi informado o id do voucher!'});

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Code.findAndCountAll({where: {voucherId: voucherId}, offset, limit, order: [['createdAt', 'DESC']],});

    return res.status(200).json({
      ages: Math.ceil(count / limit),
      vouchers: rows,
    });

  } catch {
    return res.status(500).json({ error: 'Erro ao buscar códigos: ' + error });
  }
});

exports.createManualSale = catchAsync(async(req,res) => {

  const {codeId, customerCpf, customerName, customerEmail, recieveEmail} = req.body;

  if (!codeId) return res.status(404).json({ message: 'Não foi informado o id do código para venda manual!'});
  if (!customerCpf) return res.status(404).json({ message: 'Não foi informado o CPF do Comprador para venda manual!'});
  if (!customerName) return res.status(404).json({ message: 'Não foi informado o Nome do Comprador para venda manual!'});
  if (!customerEmail) return res.status(404).json({ message: 'Não foi informado o E-mail do Comprador para venda manual!'});

  try {
    const { customerName, customerCpf, customerEmail, recieveEmail } = req.body;

    const code = await Code.findOne({ where: { id: codeId } });
    if (!code) {
      return res.status(400).json({ error: 'Não foi encontrado nenhum código com este ID!' });
    }

    const voucherFromCode = await Voucher.findOne({ where: { id: code.voucherId } });
    if (!voucherFromCode) {
      return res.status(400).json({ error: 'Voucher não encontrado para o código informado!' });
    };

    voucherFromCode.availableQuantity -= 1;
    await voucherFromCode.save();

    const totalAmount = voucherFromCode.paymentValue || 0.00;

    const orderData = await Order.create({
      customerName,
      customerCpf,
      customerEmail,
      paymentMethod: "PIX", 
      totalAmount,
      status: 'paid',
    });

    await VoucherReservationHistory.create({
      memberCPF: customerCpf,
      voucherId: voucherFromCode.id,
      orderNumber: orderData.orderNumber,
      quantity: 1,
      barCode: code.barCode,
      reservationStatus: 'completed',
      paymentValue: totalAmount,
      reservationDate: new Date(),
    });

    code.status = "purchased";
    await code.save();

    if (recieveEmail) {
      try {
        sendMailWithVouchers(orderData, [code]);
      } catch (emailError) {
        console.warn("Erro ao enviar e-mail:", emailError);
      }
    }

    return res.status(201).json({ message: 'Venda Manual realizada com sucesso!' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao realizar venda manual", error: error.message });
  }

})