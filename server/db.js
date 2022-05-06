// 连接数据库配置
module.exports = {
  mysql: {
    host: '127.0.0.1', // 域名，这是本机域名
    user: 'root', // MySQL 登录用户名
    password: '123456', // MySQL 登录密码 一般都是 root
    database: 'hotel_menegement', // 要连接的数据库名
    port: '3306', // 数据库端口号
  },
};