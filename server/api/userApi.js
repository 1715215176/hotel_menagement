// homeApi.js
const models = require("../db"); // 引入db配置
const express = require("express"); // express框架
const router = express.Router();
const mysql = require("mysql");

// 连接数据库
const conn = mysql.createConnection(models.mysql);
conn.connect();
router.post("/login", (req, res) => {
  const parms = req.body;
  const sql = `select * from user where user_id='${parms.userId}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
      let data = {
        data: '',
        code: "400",
        message: "系统异常",
      };
      res.send(data);
    }
    if (result.length === 0) {
      let data = {
        data: '',
        code: "400",
        message: "该账户未注册",
      };
      res.send(data);
    }
    if (result.length > 0) {
      if (result[0].password === parms.pas) {
        let data = {
          data: {
            name: result[0].user_name,
            userId: result[0].user_id,
          },
          code: "200",
          message: "",
        };
        res.send(data);
      } else {
        let data = {
          data: '',
          code: "400",
          message: "密码错误",
        };
        res.send(data);
      }
    }
  });
});
router.post('/changePas', (req, res) => {
  const params = req.body;
  const sql = `select * from user where user_id='${params.userId}'`
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      const data = {
        code: '400',
        message: '系统异常'
      }
      res.send(data);
    }
    if (result.length > 0) {
      if (result[0].password === params.oldPas) {
        const sql = `update user set password='${params.password}' where user_id='${params.userId}'`;
        conn.query(sql, (err, result) => {
          if (err) {
            console.log(err);
            const data = {
              code: '400',
              message: '系统异常'
            }
            res.send(data);
          }
          if (result) {
            const data = {
              code: '200',
              message: ''
            }
            res.send(data);
          }
        })
      } else {
        let data = {
          data: '',
          code: "400",
          message: "初始密码错误",
        };
        res.send(data);
      }
    }
  })
})
module.exports = router;