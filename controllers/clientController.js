const Client = require('../models/client');
const catchAsync = require('../utils/catchAsync');

exports.createClient = catchAsync(async (req, res) => {
  try {
    const { name, cnpj } = req.body;
    const logoUrl = req.file?.path || null;

    const newClient = await Client.create({
      name,
      cnpj,
      logo_url: logoUrl,
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

exports.getAllClients = catchAsync(async (req, res) => {

  const clients = await Client.findAll();

  res.status(200).json({
    status: 'success',
    results: clients.length,
    data: {
      clients,
    },
  });

});

exports.getClient = catchAsync(async (req, res, next) => {


  const client = await Client.findOne({where: {id: req.params.id}});

  if (!client) {
    return res.status(404).json({ status: 'fail', message: 'Cliente não encontrado' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      client,
    },
  });

});

exports.updateClient = catchAsync(async (req, res, next) => {
  const { name, cnpj } = req.body;
  const { id } = req.params;
  const logoUrl = req.file?.path || null;

  const [updateCount] = await Client.update(
    { name, cnpj, logoUrl },
    { where: { id: id } }
  );

  if (updateCount === 0) {
    return res.status(404).json({ status: 'fail', message: 'Cliente não encontrado ou nenhuma alteração realizada' });
  }

  const updatedClient = await Client.findOne({where : {id: id}});

  res.status(200).json({
    status: 'success',
    data: {
      updatedClient,
    },
  });

});

exports.deleteClient = catchAsync(async (req, res, next) => {
  
  const client = await Client.destroy({
    where : {
      id : req.params.id
    }
  })

  if (!client) {
    return res.status(404).json({ status: 'fail', message: 'Cliente não encontrado' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });

});
