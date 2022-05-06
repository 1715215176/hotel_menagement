// homeApi.js
const models = require("../db"); // 引入db配置
const express = require("express"); // express框架
const router = express.Router();
const mysql = require("mysql");

// 连接数据库
const conn = mysql.createConnection(models.mysql);
conn.connect();
router.post("/getlist", (req, res) => {
  const parms = req.body;
  const sql = `select * from home_info_data where check_in_date='${parms.date}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result, "首页数据以获取");
      const questions = result.map((q) => ({
        curMoney: q.cur_momey,
        curNumberTotal: q.cur_num_total,
        haveMember: q.have_membe,
      }));
      let data = {
        data: questions[0],
        code: "200",
        message: "",
      };
      res.send(data);
    }
  });
});
router.get('/getHomeDetail', (req, res) => {
  const sql = 'SELECT * from order_list WHERE TO_DAYS(NOW()) -TO_DAYS(check_in_date) <= 12';
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      let data = {
        data: '',
        code: "400",
        message: "系统异常",
      };
      res.send(data);
      return;
    }
    if (result) {
      const questions = result.map((q) => ({
        roomTypeName: q.room_type_name,
        date: q.check_in_date,
        price: q.price,
      }));
      let data = {
        data: questions,
        code: "200",
        message: "",
      };
      res.send(data);
    }
  })
})

module.exports = router;
