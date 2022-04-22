// homeApi.js
const models = require('../db') // 引入db配置
const express = require('express') // express框架
const router = express.Router()
const mysql = require('mysql')
const moment = require('moment');

// 连接数据库
const conn = mysql.createConnection(models.mysql)
conn.connect();
router.post("/getMemberInfo", (req, res) => {
  const parms = req.body;
  let sql = '';
  if (parms.checkinPhone) {
    sql = `select * from member where member_phone='${parms.checkinPhone}'`;
  } else {
    sql = 'select * from member';
  }
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      console.log(result, "会员信息获取成功");
      const questions = result.map(q => ({
        memebrPhone: q.member_phone,
        level: q.level,
        upgrade: q.upgrade,
        memberNo: q.member_no
      }));
      let data = {
        data: parms.checkinPhone ? questions[0] : questions,
        code: "200",
        message: "",
      };
      res.send(data);
    }
  });
});
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
router.post("/getOrderList", (req, res) => {
  const parms = req.body;
  // let sql = `select * from order_list where 1=1 order by id desc limit ${(parms.pageIndex - 1) * 10}, ${parms.pageIndex * parms.pageSize}`;
  let sql = `select * from order_list where 1=1`;
  if (parms.checkinPhone) {
    sql = `${sql} and checkin_phone='${parms.checkinPhone}'`;
  }
  if (parms.orderId) {
    sql = `${sql} and order_id='${parms.orderId}'`;
  }
  if (parms.checkinPeople) {
    sql = `${sql} and checkin_people='${parms.checkinPeople}'`;
  }
  if (parms.roomType) {
    sql = `${sql} and room_type='${parms.roomType}'`;
  }
  if (parms.isOut !== null) {
    sql = `${sql} and is_out='${parms.isOut}'`;
  }
  conn.query(sql, function (err, result) {
    console.log(sql);
    if (err) {
      console.log(err);
    }
    if (result) {
      const questions = result.map(q => ({
        orderId: q.order_id,
        roomTypeName: q.room_type_name,
        roomNo: q.room_no,
        checkinPeople: q.checkin_people,
        checkinPhone: q.checkin_phone,
        price: q.price,
        memberNo: q.member_no,
        roomType: q.room_type,
        checkinDate: q.check_in_date,
        level: q.level,
        isOut: q.is_out,
      }));
      let data = {
        data: questions,
        total: questions.length,
        code: "200",
        message: "",
      };
      res.send(data);
    }
  });
});
router.post("/addOrder", (req, res) => {
  const parms = req.body;
  const date = moment().format('YYYY-MM-DD');
  const orderId = `${moment().format('YYMMDDhhmmss')}${parms.checkinPhone.substr(7, 4)}`;
  const sql = `insert into order_list (order_id, room_type_name, room_no, checkin_people, checkin_phone, price, member_no, room_type, check_in_date, level) values ('${orderId}','${parms.roomTypeName}','${parms.roomNo}','${parms.checkinPeople}','${parms.checkinPhone}',${parms.price},'${parms.memberNo}',${parms.roomType}, '${date}', ${parms.level})`;
  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      // 修改房型状态为已入住
      const sql = `update room_list set is_empty=1 where room_no=${parms.roomNo}`;
      conn.query(sql, function (err) {
        if (err) {
          console.log(err);
        }
      });
      // 修改每日营业数据
      const sql1 = `select * from home_info_data where check_in_date='${date}'`;
      conn.query(sql1, function (err, result) {
        if (err) {
          console.log(err);
        }
        if (result && result.length > 0) {
          const sql2 = `update home_info_data set cur_num_total=${result[0].cur_num_total + 1}, cur_momey=${result[0].cur_momey + parms.price} where check_in_date='${date}'`;
          conn.query(sql2, function (err) {
            if (err) {
              console.log(err);
            }
          });
        } else {
          const sql = `insert into home_info_data (cur_momey, check_in_date) values (${parms.price}, '${date}')`;
          conn.query(sql, (err) => {
            if (err) {
              console.log(err);
            }
          });
        }
      });
      let data = {
        data: '',
        code: "200",
        message: "",
      };
      res.send(data);
    }
  });
});
router.post('/checkout', (req, res) => {
  const parms = req.body;
  const sql1 = `select * from member where member_phone='${parms.checkinPhone}'`;
  conn.query(sql1, function (err, result) {
    if (err) {
      console.log(err);
    }
    // 说明当前用户不是会员等急 升级为白银卡
    if (result.length === 0) {
      let sql = `insert into member (member_phone,level, upgrade, member_no) values ('${parms.checkinPhone}',1 , 5, '${moment().format('YYMMDDhhmmss')}')`;
      conn.query(sql, function (err, result) {
        if (err) {
          console.log(err);
          let data = {
            data: '',
            code: "400",
            message: "会员新增失败",
          };
          res.send(data);
          return;
        }
        if (result) {
          console.log('新增会员成功');
        }
      });
    } else {
      // 判断当前用户是否为白影卡
      if (result[0].level === 1) {
        // 等于 0 说明需要升级金卡
        if (result[0].upgrade === 0) {
          let sql = `update member set level=${2}, upgrade=10 where member_phone='${parms.checkinPhone}'`;
          conn.query(sql, function (err, result) {
            if (err) {
              let data = {
                data: '',
                code: "400",
                message: "升级金卡失败",
              };
              res.send(data);
              return;
            }
            if (result) {
              console.log('会员升级成功');
            }
          });
        } else {
          let sql = `update member set upgrade=${result[0].upgrade - 1} where member_phone='${parms.checkinPhone}'`;
          conn.query(sql, function (err, result) {
            if (err) {
              console.log(err);
              let data = {
                data: '',
                code: "400",
                message: "剩余升级天数变动失败",
              };
              res.send(data);
            }
            if (result) {
              console.log('入住天数减一');
            }
          });
        }
      }
      if (result[0].level === 2) {
        // 等于 0 说明需要升级白金卡
        if (result[0].upgrade === 0) {
          let sql = `update member set level=${3}, upgrade=15 where member_phone='${parms.checkinPhone}'`;
          conn.query(sql, function (err, result) {
            if (err) {
              console.log(err);
              let data = {
                data: '',
                code: "400",
                message: "升级白金卡失败",
              };
              res.send(data);
            }
            if (result) {
              console.log('会员升级成功');
            }
          });
        } else {
          let sql = `update member set upgrade=${result[0].upgrade - 1} where member_phone='${parms.checkinPhone}'`;
          conn.query(sql, function (err, result) {
            if (err) {
              console.log(err);
            }
            if (result) {
              console.log('入住天数减一');
            }
          });
        }
      }
      if (result[0].level === 3) {
        // 等于 0 说明需要升级金卡
        if (result[0].upgrade === 0) {
          console.log('当前等级为最高等级');
        } else {
          let sql = `update member set upgrade=${result[0].upgrade - 1} where member_phone='${parms.checkinPhone}' `;
          conn.query(sql, function (err, result) {
            if (err) {
              console.log(err);
            }
            if (result) {
              console.log('入住天数减一');
            }
          });
        }
      }
    }
    const sql2 = `update room_list set is_empty=0 where room_no='${parms.roomNo}'`;
    conn.query(sql2, function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        console.log('房型状态已修改');
      }
    });
    const sql3 = `update order_list set is_out=0 where order_id='${parms.orderId}'`;
    conn.query(sql3, function (err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        let data = {
          data: '',
          code: "200",
          message: "离店成功",
        };
        res.send(data);
      }
    });
  })
});

module.exports = router;