const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty:{
        msg: 'O nome do usuário não deve estar vazio'
      },
      notNull: {
        msg: 'O nome do usuário é obrigatório'
      },
    }
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
      isUnique: function(value, next){
        User.findOne({
          where : {
            email:value,
          }
        }).then(function(result){
          if(result){
            return next('Já existe um usuário com este e-mail!')
          }
          return next();
        }).catch(err =>{
            return next()
        })
      }
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    select: false,
    validate: {
      len: {
        args: [3, 255],
        msg: 'A senha deve ter pelo menos 3 caracteres',
      },
      notNull: {
        msg: 'A senha é obrigatória'
      },
    }
  }},
  {
    timestamps: true,
  },
);

User.beforeCreate((async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
}));

User.beforeUpdate((async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
}));

User.findAll({
  attributes: { exclude: ['password'] }
});

User.findOne({
  attributes: { exclude: ['password'] }
});

User.sync({ force: false });

module.exports = User