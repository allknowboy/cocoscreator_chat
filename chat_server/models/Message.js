const Sequelize = require('sequelize');
const dbClient = require('../DbClient');

//定义表结构
let Message = dbClient.define('tb_messages', {
    uid:{type: Sequelize.INTEGER,  autoIncrement: true, primaryKey: true},
    fromuid:{type: Sequelize.INTEGER , allowNull:true},
    message:{type:Sequelize.STRING(1024) , allowNull:false},
    touid:{type:Sequelize.STRING , defaultValue:""}
});

//没有表的时候创建表
Message.sync();

module.exports = Message;