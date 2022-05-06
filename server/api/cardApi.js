// homeApi.js
const models = require('../db') // 引入db配置
const express = require('express') // express框架
const router = express.Router()
const mysql = require('mysql')

// 连接数据库
const conn = mysql.createConnection(models.mysql)
conn.connect();
/** 获取全部的会员卡 */
router.post("/getMemberCard", (req, res) => {
  let sql = 'select * from crad_list';
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result, "会员卡获取成功");
      const questions = result.map(q => ({
        cradName: q.crad_name,
        cradNum: q.crad_num,
        cradFlag: q.crad_flag,
        upgrade: q.upgrade,
        price: q.price,
        discount: q.discount
      }));
      let data = {
        data: questions,
        code: "200",
        message: "",
        total: questions.length
      };
      res.send(data);
    }
  });
});
/** 购买会员卡 */
router.post("/buy", (req, res) => {
  const param = req.body;
  let sql = `update member set level=${param.level}, upgrade=${param.upgrade} where member_phone='${param.checkinPhone}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      let data = {
        code: "400",
        message: "会员卡购买失败",
      };
      res.send(data);
    }
    if (result) {
      let data = {
        data: 'questions',
        code: "200",
        message: "",
      };
      res.send(data);
    }
  });
});

module.exports = router;

