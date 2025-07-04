const Establishment = require('../models/establishment.js');
const catchAsync = require('../utils/catchAsync.js');

exports.createEstablishment = catchAsync(async (req, res) => {
  try {
    const { name } = req.body;
    const logoUrl = req.file?.path || null;

    const newEstablishment = await Establishment.create({
      name,
      logo_url: logoUrl,
    });

    res.status(201).json(newEstablishment);
  } catch (error) {
    console.error(error); 
    res.status(400).json({ error: error.message });
  }
});

exports.getAllEstablishments = catchAsync(async (req, res) => {

  const {category, keyword} = req.query || "";

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  const filterCategory = !category ? {offset,limit} :  {where: {category: category},offset,limit};
  const filterKeyword = !keyword ? {offset,limit} :  {where: {name: keyword},offset,limit};

  try {

    const establishments = await Establishment.findAndCountAll(filterCategory);
  
    res.status(200).json({
      status: 'success',
      results: establishments.length,
      establishments,
      
    });

  } catch(error) {
    console.error(error); 
    res.status(400).json({ error: error.message });
  }


});

exports.getEstablishment = catchAsync(async (req, res, next) => {


  const establishment = await Establishment.findOne({where: {id: req.params.id}});

  if (!establishment) {
    return res.status(404).json({ status: 'fail', message: 'Estabelecimento não encontrado' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      establishment,
    },
  });

});

exports.updateEstablishment = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { id } = req.params;
  const logo_url = req.file?.path || null;

  try {
    const [updateCount] = await Establishment.update(
      { name, logo_url, category },
      { where: { id: id } }
    );
  
    if (updateCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Estabelecimento não encontrado ou nenhuma alteração realizada' });
    }
  
    const updatedEstablishment = await Establishment.findOne({where : {id: id}});
  
    res.status(200).json({
      status: 'success',
      updatedEstablishment,
    });

  } catch(error) {
    console.error(error); 
    res.status(400).json({ error: error.message });
  }

});

exports.deleteEstablishment = catchAsync(async (req, res, next) => {
  
  const establishment = await Establishment.destroy({
    where : {
      id : req.params.id
    }
  })

  if (!establishment) {
    return res.status(404).json({ status: 'fail', message: 'Estabelecimento não encontrado' });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });

});