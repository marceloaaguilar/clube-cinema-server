const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerCpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

Order.beforeCreate(async (order) => {
  const prefix = 'VOU-'
  const baseNumber = 1000

  const lastOrder = await Order.findOne({
    order: [['createdAt', 'DESC']],
  })

  let nextNumber = baseNumber + 1

  if (lastOrder && lastOrder.orderNumber) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace(prefix, ''))
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1
    }
  }

  order.orderNumber = `${prefix}${nextNumber}`
});

Order.sync({alter: false});

module.exports = Order;