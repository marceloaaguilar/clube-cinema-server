const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const VoucherReservationHistory = sequelize.define('VoucherReservationHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  memberCPF: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'O CPF do membro é obrigatório' },
    },
  },
  voucherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Vouchers',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'A quantidade desejada é obrigatória' },
    },
  },
  reservationStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'canceled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  orderNumber: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  paymentValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  reservationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, { timestamps: true });

VoucherReservationHistory.sync({alter: true});

module.exports = VoucherReservationHistory;