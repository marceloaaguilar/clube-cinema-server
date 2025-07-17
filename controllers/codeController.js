const catchAsync = require("../utils/catchAsync");

const Code = require("../models/code");
const Voucher = require("../models/voucher");

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
