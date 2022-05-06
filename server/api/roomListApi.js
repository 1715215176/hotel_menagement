// homeApi.js
const models = require("../db"); // 引入db配置
const express = require("express"); // express框架
const router = express.Router();
const mysql = require("mysql");

// 连接数据库
const conn = mysql.createConnection(models.mysql);
conn.connect();

router.post("/getRoomList", (req, res) => {
  const parms = req.body;
  let sql = "";
  if (parms.roomTypeName) {
    sql = `select * from room_type_list where room_type_name='${parms.roomTypeName}'`;
  } else {
    sql = "select * from room_list";
  }
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      const questions = result.map((q) => ({
        id: q.id,
        roomNo: q.room_no,
        roomTypeName: q.room_type_name,
        roomTypeId: q.room_type_id,
        isWindow: q.is_window,
        isBathroom: q.is_bathroom,
        isAir: q.is_air,
        isEmpty: q.is_empty,
        price: q.price,
        state: q.state,
        hourPrice: q.hour_price
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
  let sql = "";
  if (parms.id) {
    // 新增数据
    sql = `update room_list set state=${parms.state},room_type_name='${parms.roomTypeName}',room_no=${parms.roomNo},is_window=${parms.isWindow},is_bathroom=${parms.isBathroom},is_air=${parms.isAir},price=${parms.price},room_type_id=${parms.roomTypeId}, hour_price=${parms.hourPrice} where id=${parms.id}`;
  } else {
    // 更新数据
    sql = `insert into room_list (room_no, room_type_name, is_window,is_bathroom,is_air,room_type_id,price, state, hour_price) values ('${parms.roomNo}','${parms.roomTypeName}',${parms.isWindow},${parms.isBathroom},${parms.isAir},${parms.roomTypeId},${parms.price},${parms.state},${parms.hourPrice})`;
  }
  let upDateSql = `select room_num from room_type_list where id=${parms.roomTypeId}`;
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
  if (!parms.id) {
    conn.query(upDateSql, function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        const sql = `update room_type_list set room_num=${result[0].room_num - 1
          } where id=${parms.roomTypeId}`;
        conn.query(sql, function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
  }
});
// 获取房型数据
router.post("/getRoomById", (req, res) => {
  const parms = req.body;
  const sql = `select * from room_list where id=${parms.id}`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      const questions = result.map((q) => ({
        id: q.id,
        roomNo: q.room_no,
        roomTypeName: q.room_type_name,
        roomTypeId: q.room_type_id,
        isWindow: q.is_window,
        isBathroom: q.is_bathroom,
        isAir: q.is_air,
        price: q.price,
        state: q.state,
        hourPrice: q.hour_price
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
router.post("/deleteRoom", (req, res) => {
  const parms = req.body;
  const sql = `delete from room_list where id=${parms.id}`;
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
  const sql = `update room_list set state=${parms.state} where id=${parms.id}`;
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

module.exports = router;
