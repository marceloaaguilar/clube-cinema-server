
const Order = require('./order');
const VoucherReservationHistory = require('./voucherReservationHistory');

Order.hasMany(VoucherReservationHistory, {
  foreignKey: 'orderNumber',
  sourceKey: 'orderNumber',
});

VoucherReservationHistory.belongsTo(Order, {
  foreignKey: 'orderNumber',
  targetKey: 'orderNumber',
});

module.exports = {
  Order,
  VoucherReservationHistory,
};
