const VoucherReservationHistory  = require('../models/voucherReservationHistory');

exports.create = async (req, res) => {
  try {
    const {
      memberCPF,
      voucherId,
      quantity,
      paymentStatus,
      paymentValue,
      paymentDate,
      paymentMethod,
    } = req.body;

    const newReservation = await VoucherReservationHistory.create({
      memberCPF,
      voucherId,
      quantity,
      paymentStatus,
      paymentValue,
      paymentDate,
      paymentMethod,
    });

    return res.status(201).json(newReservation);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao criar reserva', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await VoucherReservationHistory.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      results: count,
      rows,
      
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar reservas', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await VoucherReservationHistory.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar reserva', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const reservation = await VoucherReservationHistory.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    await reservation.update(updates);
    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar reserva', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await VoucherReservationHistory.findByPk(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    await reservation.destroy();
    return res.status(200).json({ message: 'Reserva deletada com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar reserva', error: error.message });
  }
};
