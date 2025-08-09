const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require ('../models/user.js');
const catchAsync = require('../utils/catchAsync.js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const signToken = (id) => {
  return jwt.sign({id: id}, process.env.CLUBE_CINEMA_JWT_SECRET, {
    expiresIn: process.env.CLUBE_CINEMA_JWT_EXPIRES_IN
  });
};

async function correctPassword(candidatePassword, userPassword) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.log("Error on password compare: " + error)
  }
};
 
exports.signup = catchAsync(async (req, res, next) => {

  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, 
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    })
  } catch (error) {
      console.log(error)
      return res.status(400).json({
        mensagem: "Ocorreu um erro ao realizar o cadastro",
        erro: error && error.errors? error.errors.map((e) => e.message) : error
      })
  }

});

exports.signin = async (req, res, next) => {
  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Por favor, forneça um e-mail e uma senha!'",
    })
  }

  const user = await User.findOne({where: {email: email}});
  
  if (!user || !await correctPassword(password, user.password)) {
    return res.status(401).json({
      error: true,
      message: "Credenciais inválidas!",
    })
  }
  
  const token = signToken(user.id);

  res.cookie('token', token, {
    maxAge: 3600000,
    httpOnly: true,
    sameSite: 'Lax',
    secure: false,
  });

  res.status(200).json({
    message: "Usuário autenticado com sucesso!",
    token
  })

}

exports.protect = catchAsync(async (req, res, next) => { 

  let authToken;
  let decoded;

  const FIXED_TOKEN = process.env.CLUBE_CINEMA_FIXED_JWT_TOKEN;

  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    authToken = req.headers.authorization.split(' ')[1];
  }

  if (!authToken && req.cookies && req.cookies.token) {
    authToken = req.cookies.token;
  }

  if (!authToken) {
    return res.status(401).json({
      error: true,
      message: "Você precisa se autenticar primeiro!'",
    })
  }

  if (authToken === FIXED_TOKEN) {
    req.user = { id: 'clube-rede', role: 'external' };
    return next();
  }

  try {
    decoded = await promisify(jwt.verify)(authToken, process.env.CLUBE_CINEMA_JWT_SECRET);
  } catch(error) {
      return res.status(401).json({
        error: true,
        message: "Você precisa se autenticar primeiro!'",
      })
  }

  next();

})

exports.logout = catchAsync(async (req, res, next) => {
  
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  });

  res.status(200).json({ message: 'Logout realizado com sucesso' });

});
