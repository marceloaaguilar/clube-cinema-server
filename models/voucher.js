const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Establishment = require('../models/establishment');

const Code = require("../models/code")

const Voucher = sequelize.define('Voucher',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'A data de validade deve ser uma data válida' },
        notNull: { msg: 'A data de validade é obrigatória' },
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O título não deve estar vazio' },
        notNull: { msg: 'O título é obrigatório' },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'A descrição não deve estar vazia' },
        notNull: { msg: 'A descrição é obrigatória' },
      },
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    voucherValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'O valor do voucher deve ser um número válido' },
        notNull: { msg: 'O valor do voucher é obrigatório' },
      },
    },
    availableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    establishmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Establishments', 
        key: 'id',
      },
      validate: {
        notNull: { msg: 'O ID do estabelecimento é obrigatório' },
        async isValidEstablishment(value) {
          const est = await Establishment.findByPk(value);
          if (!est) {
            throw new Error('O estabelecimento informado não existe');
          }
        },
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'sold_out', 'hidden', 'awaiting_payment'),
      defaultValue: 'active',
      allowNull: false,
    },
    paymentValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: { msg: 'O valor de compra do voucher é obrigatório' },
        isDecimal: { msg: 'O valor do pagamento deve ser um número válido' },
      },
    },
  },
  { timestamps: true}
);

Voucher.hasMany(Code);

module.exports = Voucher;
