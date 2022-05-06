// 使用 express 创建服务器
// 导入 express 模块
const express = require("express");
// 调用 express 函数，返回一个数据库实例
const app = express();
// 导入路由模块
const homeApi = require("./api/homeApi");
const hotelInfoApi = require("./api/hotelInfoApi");
const roomListApi = require("./api/roomListApi");
const orderApi = require("./api/orderApi");
const cardApi = require("./api/cardApi");
const userApi = require("./api/userApi");
// 端口号
const port = 8888;
// 注册全局解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 注册路由模块
app.use("/home", homeApi);
app.use("/hotel", hotelInfoApi);
app.use("/room", roomListApi);
app.use("/order", orderApi);
app.use("/card", cardApi);
app.use("/user", userApi);
// 调用 app.listen() 启动服务器
app.listen(port, () => console.log("端口已启动。。。"));
