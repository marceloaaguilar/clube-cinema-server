const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  asaasId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  memberCPF: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'O CPF do membro é obrigatório' },
    },
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: true,
    defaultValue: 'pending'
  },
  paymentValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

Voucher.sync({alter: true});

module.exports = Payment;