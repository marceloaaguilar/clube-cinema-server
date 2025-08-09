const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty:{
        msg: 'O nome do membro não deve estar vazio'
      },
      notNull: {
        msg: 'O nome do membro é obrigatório'
      },
    }
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      ags: true,
      msg: 'Já existe um membro com este CPF!'
    },
    
    validate: {
      notEmpty: {
        msg: 'O CPF do membro não deve estar vazio'
      },
      len: {
        args: [11, 11],
        msg: 'O CPF deve conter exatamente 11 dígitos'
      },
      notNull: {
        msg: 'O CPF do membro é obrigatório'
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      ags: true,
      msg: 'Já existe um usuário com este e-mail!'
    },
    validate: {
      isEmail: {
        msg: 'Por favor, forneça um endereço de e-mail válido',
      },
      notEmpty: {
        msg: 'O e-mail do usuário não deve estar vazio'
      },
      notNull: {
        msg: 'O e-mail do usuário é obrigatório'
      },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},
  {
    timestamps: true,
  },
);


module.exports = Member