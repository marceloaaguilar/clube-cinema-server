const catchAsync = require('../utils/catchAsync.js');
const Voucher  = require('../models/voucher.js');
const VoucherReservationHistory  = require('../models/voucherReservationHistory.js');
const asaasApi = require('../services/asaasService.js');

const Code = require("../models/code.js");

exports.createVoucher = catchAsync(async (req, res, next) => {

  try {
    const {
      expirationDate,
      title,
      description,
      voucherValue,
      establishmentId,
      status,
      paymentRequired,
      paymentValue
    } = req.body;

    if (!expirationDate) {
      return res.status(400).json({ error: 'A data de validade é obrigatória' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título é obrigatório' });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'A descrição é obrigatória' });
    }

    if (!voucherValue || isNaN(voucherValue) || voucherValue <= 0) {
      return res.status(400).json({ error: 'O valor do voucher deve ser um número positivo' });
    }


    if (!establishmentId) {
      return res.status(400).json({ error: 'O ID do estabelecimento é obrigatório' });
    }

    if (paymentRequired) {
      if (!paymentValue || isNaN(paymentValue) || paymentValue <= 0) {
        return res.status(400).json({ error: 'Quando o pagamento é obrigatório, o valor do pagamento deve ser um número positivo' });
      }
    }
    
    if (status && !['active', 'expired', 'sold_out', 'hidden', 'awaiting_payment'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const newVoucher = await Voucher.create(req.body);

    return res.status(201).json(newVoucher);

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Este código de voucher já está em uso' });
    }
    return res.status(400).json({ error: error.message });
  }
})

exports.getAllVouchers = catchAsync(async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Voucher.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      ages: Math.ceil(count / limit),
      vouchers: rows,
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar vouchers: ' + error });
  }
});

exports.getAllVouchersWithCode = catchAsync(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Voucher.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
     ages: Math.ceil(count / limit),
      vouchers: rows,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar vouchers: ' + error });
  }
});

exports.getVoucher = catchAsync(async (req, res, next) => {
  
  const voucher = await Voucher.findOne({
    where: {id: req.params.id},
  });

  if (!voucher) {
    return res.status(404).json({ status: 'fail', message: 'Voucher não encontrado' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      voucher,
    },
  });

});

exports.bookVoucher = async (req, res) => {

  let codeIsAvailable;

  try {

    const {clientData, quantity, creditCard, creditCardHolderInfo, voucherId, paymentMethod} = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantidade desejada é obrigatória e deve ser maior que zero.' });
    }

    const voucher = await Voucher.findOne({where: {id: voucherId}});

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher não encontrado.' });
    }

    if (voucher.availableQuantity < 5) {
      return res.status(400).json({ message: 'O voucher possui menos de 5 códigos disponíveis.' });
    }

    if (voucher.availableQuantity < quantity) {
      return res.status(400).json({ message: 'Quantidade solicitada maior que o estoque disponível.' });
    }

    if (!paymentMethod) return res.status(400).json({ message: 'É obrigatório fornecer o método de pagamento!' });

    if (paymentMethod === "CREDIT_CARD") {

      if (!creditCard?.holderName || !creditCard?.number || !creditCard?.expiryMonth || !creditCard?.expiryYear || !creditCard?.ccv) {
        return res.status(400).json({ message: 'Dados do cartão são obrigatórios para compra.' });
      }

      if (!creditCardHolderInfo?.name || !creditCardHolderInfo?.email || !creditCardHolderInfo?.cpfCnpj || !creditCardHolderInfo?.postalCode || !creditCardHolderInfo?.phone) {
        return res.status(400).json({ message: 'Dados do titular do cartão são obrigatórios para compra.' });
      }
    }

    const codesAvailable = await Code.findAll({
      where: {
        voucherId: voucher.id,
        status: 'available'
      },
      order: [['sequential', 'ASC']], 
      limit: quantity
    });

    if (!codesAvailable || codesAvailable.length === 0) return res.status(400).json({ message: 'Ocorreu um erro durante a reserva do voucher.' });

    for (const code of codesAvailable) {
      code.isLocked = true;
      await code.save();
    }
 
    const paymentData = {
      clientData: clientData,
      paymentValue: voucher.paymentValue * quantity,
      voucherId: voucher.id,
      creditCard: creditCard,
      paymentMethod: paymentMethod,
      creditCardHolderInfo: creditCardHolderInfo
    }

    const paymentResult = await asaasApi.createAndConfirmPayment(paymentData);

    if (!paymentResult || paymentResult.error) {
      return res.status(500).json({ message: 'Erro ao comprar voucher', error: error.message });
    }

    voucher.availableQuantity -= quantity;
    await voucher.save();

    for (const code of codesAvailable) {
      code.status = 'purchased';
      code.isLocked = false;
      await code.save();
    }

    const memberCPF = clientData?.cpfCnpj;
    
    await VoucherReservationHistory.create({
      memberCPF,
      voucherId,
      quantity,
      reservationStatus: 'completed',
      paymentStatus: 'paid',
      paymentValue: voucher.paymentValue * quantity,
      reservationDate: new Date(),
      paymentMethod: paymentMethod === "CREDIT_CARD" ? "CREDIT_CARD" : "PIX",
    });

    return res.status(201).json({ message: 'Voucher comprado com sucesso.' });
  } catch (error){

      return res.status(500).json({ 
      message: (error.message || 'Erro desconhecido'), 
      error: error.message || error 
    });

  } finally {
    if (codeIsAvailable) {
      codeIsAvailable.isLocked = false;
      await codeIsAvailable.save();
    }
  };
}
