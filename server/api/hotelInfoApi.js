// homeApi.js
const models = require("../db"); // 引入db配置
const express = require("express"); // express框架
const router = express.Router();
const mysql = require("mysql");

// 连接数据库
const conn = mysql.createConnection(models.mysql);
conn.connect();

router.post("/getRoomTypeList", (req, res) => {
  const parms = req.body;
  let sql = "";
  if (parms.roomTypeName) {
    sql = `select * from room_type_list where room_type_name='${(parms.roomTypeName)}'`;
  } else {
    sql = "select * from room_type_list";
  }
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result, "首页数据以获取");
      const questions = result.map((q) => ({
        id: q.id,
        roomTypeName: q.room_type_name,
        roomNum: q.room_num,
        roomPeople: q.room_people,
        state: q.state,
      }));
      let data = {
        data: questions,
        code: "200",
        message: "",
        total: questions && questions.length,
      };
      res.send(data);
    }
  });
});

// 新增列表
router.post("/addRoom", (req, res) => {
  const parms = req.body;
  let sql = '';
  if (parms.id) {
    // 新增数据
    sql = `update room_type_list set state=${parms.state},room_type_name='${parms.roomTypeName}',room_num=${parms.roomNum},room_people=${parms.roomPeople} where id=${parms.id}`
  } else {
    // 更新数据
    sql = `insert into room_type_list (room_type_name, room_num, room_people, state) values ('${parms.roomTypeName}',${parms.roomNum},${parms.roomPeople},${parms.state})`
  }
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let data = {
        data: "",
        code: "200",
        message: "房型添加成功~",
      };
      res.send(data);
    }
  });
});
// 删除房型
router.post("/deleteRoom", (req, res) => {
  const parms = req.body;
  const sql = `delete from room_type_list where id=${parms.id}`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let data = {
        data: "",
        code: "200",
        message: "房型删除成功~",
      };
      res.send(data);
    }
  });
});
// 修改房型状态
router.post("/updateState", (req, res) => {
  const parms = req.body;
  const sql = `update room_type_list set state=${parms.state} where id=${parms.id}`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      let data = {
        data: "",
        code: "200",
        message: "房型状态添加完成~",
      };
      res.send(data);
    }
  });
});
// 获取房型数据
router.post("/getRoomById", (req, res) => {
  const parms = req.body;
  const sql = `select * from room_type_list where id=${parms.id}`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      const questions = result.map((q) => ({
        id: q.id,
        roomTypeName: q.room_type_name,
        roomNum: q.room_num,
        roomPeople: q.room_people,
        state: q.state,
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

module.exports = router;
