const { Order, VoucherReservationHistory } = require('../models');

exports.getOrdersWithBarCode = async(req, res) => {

  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const orders = await Order.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [{
        model: VoucherReservationHistory,
        attributes: ['barCode']
      }],
    });

    res.status(200).json({
      status: 'success',
      orders,
    });
    
  } catch (error) {
    console.error(error); 
    res.status(400).json({ error: error.message });
  }



}