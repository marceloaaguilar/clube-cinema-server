const catchAsync = require('../utils/catchAsync.js');
const Voucher  = require('../models/voucher.js');
const VoucherReservationHistory  = require('../models/voucherReservationHistory.js');

const asaasApi = require('../services/asaasService.js');
const sendMailWithVouchers = require('../services/sendEmail.js');

const {Op} = require("@sequelize/core")

const Code = require("../models/code.js");
const Order = require("../models/order.js");

exports.createVoucher = catchAsync(async (req, res, next) => {

  try {
    const {
      expirationDate,
      title,
      description,
      establishmentId,
      codes,
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

    for (const [index, code] of (codes || []).entries()) {

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

    }

    if (!codes || codes.length === 0) {
      return res.status(400).json({ error: "Não existem códigos para cadastrar!" });
    }

    const newVoucher = await Voucher.create(req.body);

    const voucherId = newVoucher.id;
    const codesToRegister = codes.map(code => ({...code, voucherId}));

    await Code.bulkCreate(codesToRegister);

    await newVoucher.update({ availableQuantity: codesToRegister.length });
    await newVoucher.save();

    return res.status(201).json(newVoucher);

  } catch (error) {

    return res.status(400).json({ error: error.message });
  }
})

exports.getAllVouchers = catchAsync(async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const cinema = req.query.cinema;
    
    let where = {
      availableQuantity: {
        [Op.gt]: 5
      }
    };

    if (cinema) {
      where.establishmentId = cinema;
    }

    const { count, rows } = await Voucher.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      where
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

  try {

    const {clientData, creditCard, creditCardHolderInfo, vouchers, paymentMethod} = req.body;
    let reservations = [];
    let codes = [];

    const memberCPF = clientData?.cpfCnpj;

    if (!vouchers || vouchers.length === 0) {
      return res.status(404).json({ message: 'É obrigatório fornecer pelo menos um voucher para compra.' });
    };

    if(vouchers.find((voucher)=> !voucher.quantity)){
      return res.status(404).json({ message: 'Não foi informada a quantidade desejada para os vouchers.' });
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

    const allVouchers = await Promise.all(
      vouchers.map(async (voucher) => {
        const voucherExists = await Voucher.findOne({ where: { id: voucher.id } })

        if (!voucherExists) {
          throw new Error(`Voucher não encontrado: ${voucher.id}`)
        }

        if (voucherExists.availableQuantity < 5) {
          throw new Error(`O voucher ${voucher.id} possui menos de 5 códigos disponíveis.`)
        }

        if (voucherExists.availableQuantity < voucher.quantity) {
          throw new Error(`Quantidade solicitada maior que o estoque disponível para o voucher: ${voucher.id}`)
        }

        const codesAvailable = await Code.findAll({
          where: {
            voucherId: voucher.id,
            status: 'available'
          },
          order: [['sequential', 'ASC']],
          limit: voucher.quantity
        });

        if (!codesAvailable || codesAvailable.length === 0) {
          throw new Error(`Não há códigos disponíveis para o voucher: ${voucher.id}`)
        }

        codes.push(...codesAvailable);

        await Promise.all(
          codesAvailable.map(async (code) => {
            code.isLocked = true
            await code.save()
          })
        )

        return {
          id: voucherExists.id,
          name: voucherExists.name,
          paymentValue: Number(voucherExists.paymentValue),
          quantity: voucher.quantity,
          codes: codesAvailable.map((c) => c.barCode)
        }
      })
    )

    const totalAmount = allVouchers.reduce(
      (acc, voucher) => acc + voucher.paymentValue * voucher.quantity,
      0
    )

    let paymentData = {
      clientData: clientData,
      totalAmount,
      creditCard: creditCard,
      paymentMethod: "CREDIT_CARD",
      creditCardHolderInfo: creditCardHolderInfo
    }

    let paymentResult = await asaasApi.createAndConfirmPayment(paymentData);
    if (!paymentResult || paymentResult.error) {
      return res.status(500).json({ message: 'Erro ao comprar voucher', error: error.message });
    }

    for (const voucher of allVouchers) {
      const voucherRecord = await Voucher.findOne({ where: { id: voucher.id } })
      voucherRecord.availableQuantity -= voucher.quantity
      await voucherRecord.save()

      const codes = await Code.findAll({
        where: {
          barCode: voucher.codes
        }
      })

      await Promise.all(
        codes.map(async (code) => {
          code.status = 'purchased'
          code.isLocked = false
          await code.save()
        })
      );

      codes.map((code) => {
        reservations.push({
          memberCPF,
          voucherId: voucher.id,
          quantity: voucher.quantity,
          barCode: code.barCode,
          reservationStatus: 'completed',
          paymentValue: voucher.paymentValue * voucher.quantity,
          reservationDate: new Date(),
        })
      })

    }

    const order = await Order.create({
      customerName: clientData.name,
      customerCpf: memberCPF,
      customerEmail: clientData.email,
      totalAmount,
      status: 'paid',
      paymentMethod,
    });
 
    const reservationsWithOrderId = reservations.map((reservation) => ({...reservation, orderNumber: order.orderNumber}));
    await VoucherReservationHistory.bulkCreate(reservationsWithOrderId);

    sendMailWithVouchers(order, codes);

    return res.status(201).json({ message: 'Voucher comprado com sucesso.' });

  } catch (error){

      return res.status(500).json({ 
      message: (error.message || 'Erro desconhecido'), 
      error: error.message || error 
    });

  }
};

exports.deleteVoucher = async (req, res) => {

  try {

    let voucher = req.params.id;
    if (!voucher) {
      return res.status(404).json({ status: 'fail', message: 'Voucher não encontrado' });
    };

    const voucherReservations = await VoucherReservationHistory.findAll({
      where: {voucherId: voucher}
    });

    if (voucherReservations && voucherReservations.length > 0) {
      return res.status(500).json({ message: 'Não é possível excluir vouchers com histórico de compra' });
    }

    await Code.destroy({
      where: {voucherId: voucher}
    });

    await Voucher.destroy({
      where: {id: voucher},
    });

    return res.status(201).json({ message: 'Voucher excluido com sucesso.' });

  } catch (error){

    return res.status(500).json({ 
     message: (error.message || 'Erro desconhecido'), 
      error: error.message || error 
    });

  }

};

exports.updateVoucher = async(req,res) => {

  try {

    const {id } = req.params;
    const {codes} = req.body;

    if (!id) return res.status(400).json({ error: 'O código do voucher não foi informado!' });

    const voucher = await Voucher.findOne({where: {id}});
    if (!voucher) return res.status(400).json({ error: 'Não foi encontrado nenhum voucher com este ID!' });

    for (const [index, code] of (codes || []).entries()) {

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

    };

    if (codes && codes.length > 0 ) {

      const voucherId = id;
      const codesToRegister = codes.map(code => ({...code, voucherId}));
      await Code.bulkCreate(codesToRegister);

      voucher.availableQuantity += codes.length;

    } 


    await voucher.update(req.body);
    await voucher.save();

    return res.status(200).json(voucher);


  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar voucher: ' + error });
  }
}