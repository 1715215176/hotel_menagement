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
            privilegeList: result[0].privilege_list
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

router.post('/getUserList', (req, res) => {
  // const params = req.body;
  const sql = `select * from user`;
  conn.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: '系统错误', code: '400' })
    }
    if (result) {
      const dataMap = result.map((item) => {
        return {
          userName: item.user_name,
          userId: item.user_id,
          id: item.id,
          state: item.state,
          privilegeList: item.privilege_list
        }
      })
      res.send({ data: dataMap, code: '200', total: dataMap.length })
    }
  })
})
router.post("/updateState", (req, res) => {
  const parms = req.body;
  const sql = `update user set state=${parms.state} where id='${parms.id}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send({ code: '200', data: '' });
    }
  });
});
router.post("/repassword", (req, res) => {
  const parms = req.body;
  const sql = `update user set password = 123 where id='${parms.id}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send({ code: '200', data: '' });
    }
  });
});
router.post("/savePrivilege", (req, res) => {
  const parms = req.body;
  const sql = `update user set privilege_list='${parms.node}' where id='${parms.id}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send({ code: '200', data: '' });
    }
  });
});
router.post("/getUserPrivilege", (req, res) => {
  const parms = req.body;
  const sql = `select privilege_list from user where id='${parms.id}'`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.send({ code: '200', data: {privilegeList: result[0].privilege_list} });
    }
  });
});
router.post("/addUser", (req, res) => {
  const parms = req.body;
  let sql = '';
  if (parms.id) {
    // 新增数据
    sql = `update user set state=${parms.state},user_name='${parms.userName}',user_id='${parms.userId}',password='${parms.password} 'where id=${parms.id}`
  } else {
    // 更新数据
    sql = `insert into user (user_name, user_id, password, state) values ('${parms.userName}','${parms.userId}','${parms.password}',${parms.state})`
  }
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let data = {
        data: "",
        code: "200",
      };
      res.send(data);
    }
  });
});
router.post("/deleteUser", (req, res) => {
  const parms = req.body;
  const sql = `delete from user where id=${parms.id}`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let data = {
        data: "",
        code: "200",
      };
      res.send(data);
    }
  });
});
module.exports = router;