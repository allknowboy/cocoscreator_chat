const Sequelize = require('sequelize');
const dbClient = require('../DbClient');

//定义表结构
let User = dbClient.define('tb_users', {
    uid:{type: Sequelize.INTEGER,  autoIncrement: true, primaryKey: true},
    account:{type:Sequelize.STRING , allowNull:false},
    password:{type:Sequelize.STRING , allowNull:false},
    imgurl:{type:Sequelize.STRING , },
    channel:{type:Sequelize.STRING , },
    age:{type:Sequelize.INTEGER,  defaultValue:0},
});

//没有表的时候创建表
User.sync();

module.exports = User;