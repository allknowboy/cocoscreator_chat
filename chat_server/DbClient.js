const Sequelize = require('sequelize');

const sequelize = new Sequelize('super', 'root', '123123', {
    host: '127.0.0.1',
    port: 3306,
    //dialect: 'mysql',
    dialect: 'sqlite',
    operatorsAliases: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    //sqlite只需要这个参数
    storage:'./db/db.sqlite'
});

sequelize.authenticate().then(() => {
    console.log('数据库连接成功');
}).catch(err => {
    console.error('数据库连接失败', err);
});

module.exports = sequelize;