const Member = require('../models/member.js');
const catchAsync = require('../utils/catchAsync.js');

exports.createMember = catchAsync(async (req, res, next) => {

  try {
    const newMember = await Member.create({
      name: req.body.name,
      email: req.body.email,
      cpf: req.body.cpf,
      phone: req.body.phone
    });

    res.status(201).json({
      status: 'success',
      data: newMember
    })
  } catch (error) {
      console.log(error)
      return res.status(400).json({
        mensagem: "Ocorreu um erro ao realizar o cadastro",
        erro: error && error.errors? error.errors.map((e) => e.message) : error
      })
  }

});

exports.getAllMembers = catchAsync(async (req, res, next) => {

  const members = await Member.findAll();

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members,
    },
  });

});

exports.getMember = catchAsync(async (req, res, next) => {

  const member = await Member.findOne({id: req.params.id});

  if (!member) {
    return res.status(404).json({ status: 'fail', message: 'Membro não encontrado' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      member,
    },
  });

});

exports.updateMember = catchAsync(async (req, res, next) => {
  const { name, email, cpf, phone } = req.body;
  const { id } = req.params;

  const [updateCount] = await Member.update(
    { name, email, cpf, phone },
    { where: {id} }
  );

  if (updateCount === 0) {
    return res.status(404).json({ status: 'fail', message: 'Membro não encontrado ou nenhuma alteração realizada' });
  }

  const updateMember = await Member.findOne({id: id});

  res.status(200).json({
    status: 'success',
    data: {
      updateMember,
    },
  });

});

exports.deleteMember = catchAsync(async (req, res, next) => {
  
  const member = await Member.destroy({
    where : {
      id : req.params.id
    }
  })

  if (!member) {
    return res.status(404).json({ status: 'fail', message: 'Membro não encontrado' });
  }

  res.status(204).json({
    status: 'success',
    data: {"Mensagem": "Membro excluido com sucesso!"},
  });

});
