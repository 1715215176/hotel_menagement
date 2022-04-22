<template>
  <el-card shadow="never">
    <div class="time">
      {{ time }} <span>周{{ week }}</span>
    </div>
    <div class="bd">房型面板</div>
    <div class="room-warp">
      <div v-for="item in roomList" :key="item.id" class="room-item">
        <div>房间号：{{ item.roomNo }}</div>
        <div>房型：{{ item.roomTypeName }}</div>
        <div>价钱：￥{{ item.price }}</div>
        <div :class="getStyle(item.isEmpty)" class="state">
          {{ item.isEmpty === 0 ? "空闲" : "已入住" }}
        </div>
        <el-button
          v-if="item.isEmpty === 0"
          type="primary"
          size="small"
          @click="openRoom(item)"
          class="open-btn"
          >开房</el-button
        >
        <!-- <el-button
          v-else
          type="primary"
          size="small"
          @click="checkout(item)"
          class="open-btn"
          >离店</el-button
        > -->
      </div>
    </div>
    <el-dialog title="入住登记" :visible.sync="dialogVisible" width="500px">
      <el-form
        :model="orderInfo"
        ref="form"
        :rules="rules"
        label-width="120px"
        :inline="false"
        size="small"
      >
        <el-form-item label="房型：" prop="roomType">
          <el-select v-model="orderInfo.roomType">
            <el-option
              v-for="item in roomTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号：" prop="checkinPhone">
          <el-input
            v-model="orderInfo.checkinPhone"
            @blur="getMemberInfo()"
            class="w200"
          ></el-input>
        </el-form-item>
        <el-form-item label="入住人姓名：" prop="checkinPeople">
          <el-input v-model="orderInfo.checkinPeople" class="w200"></el-input>
        </el-form-item>
        <el-form-item label="房间号：" prop="roomNo">
          <el-input v-model="orderInfo.roomNo" class="w200" disabled></el-input>
        </el-form-item>
        <el-form-item label="入住日期：" prop="roomNo">
          <el-input v-model="orderInfo.date" class="w200" disabled></el-input>
        </el-form-item>
        <el-form-item label="房型名称：" prop="roomNo">
          <el-input
            v-model="orderInfo.roomTypeName"
            class="w200"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item label="原价钱：" prop="roomNo">
          <span v-if="orderInfo.roomType === 1">￥{{ orderInfo.price }}</span>
          <span v-else>￥{{ orderInfo.hourPrice }}</span>
        </el-form-item>
        <el-form-item
          label="会员价："
          v-if="memberTips && orderInfo.roomType === 1"
        >
          <span
            >￥{{
              (orderInfo.price * discount[memberInfo.level - 1] * 0.1).toFixed(2)
            }}</span
          >
        </el-form-item>
      </el-form>
      <p class="red" v-if="memberTips && orderInfo.roomType === 1">
        尊敬的用户{{ memberInfo.memebrPhone }}：当前的会员等级为{{
          levelList[memberInfo.level - 1]
        }},可享受{{ discount[memberInfo.level - 1] }}折, 升至下一等级还需入住{{
          memberInfo.upgrade
        }}房晚，或直接购买会员卡
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" size="small" @click="confirmAdd"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      time: this.$moment().format("YYYY-MM-DD hh:mm:ss"),
      week: "",
      timer: null,
      roomList: [],
      orderInfo: {},
      rules: {
        roomType: [
          { required: true, message: "房型不能为空", trigger: "change" },
        ],
        checkinPhone: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
        ],
        checkinPeople: [
          { required: true, message: "入住人姓名不能为空", trigger: "blur" },
        ],
      },
      dialogVisible: false,
      memberInfo: {},
      memberTips: false,
      levelList: ["白银卡", "金卡", "铂金卡", "钻石卡"],
      discount: [9.5, 9, 8.5, 8],
      roomTypeList: [
        { label: "全日房", value: 1 },
        { label: "钟点房", value: 2 },
      ],
    };
  },
  created() {
    this.getNowTime();
    this.getRoomList();
  },
  beforeDestroy() {
    this.timer = null;
  },
  methods: {
    getNowTime() {
      this.timer = setInterval(() => {
        this.time = this.$moment().format("YYYY-MM-DD hh:mm:ss");
        this.week = this.$moment().format("E");
      }, 1000);
    },
    async getRoomList() {
      const res = await this.$axios.post("/api/room/getRoomList", {});
      if (res) {
        this.roomList = res.data;
      }
    },
    /**
     *  获取当前用户是否是会员
     */
    async getMemberInfo() {
      const res = await this.$axios.post("/api/order/getMemberInfo", {
        checkinPhone: this.orderInfo.checkinPhone,
      });
      if (res.code === "200" && res.data) {
        this.memberInfo = res.data;
        this.memberTips = true;
      } else {
        this.memberTips = false;
      }
    },
    openRoom(row) {
      this.dialogVisible = true;
      this.orderInfo = {
        roomNo: row.roomNo,
        roomTypeName: row.roomTypeName,
        price: row.price,
        hourPrice: row.hourPrice,
        date: this.$moment().format("YYYY-MM-DD"),
        checkinPeople: "",
        checkinPhone: "",
        memberNo: "",
        roomType: 1,
      };
    },
    getStyle(isEmpty) {
      if (isEmpty === 0) return "state1";
      if (isEmpty === 1) return "state2";
    },
    confirmAdd() {
      this.$refs.form.validate(async (valid) => {
        const params = {
          ...this.orderInfo,
          memberNo: this.memberInfo.memberNo || "",
          level: this.memberInfo.level || null,
        };
        if (params.roomType === 2) {
          params.price = params.hourPrice;
        }
        if (this.memberInfo.memberNo) {
          params.price =
            this.orderInfo.price *
            this.discount[this.memberInfo.level - 1] *
            (0.1).toFixed(2);
        }
        if (valid) {
          const res = await this.$axios.post("/api/order/addOrder", params);
          if (res.code === "200") {
            this.$message.success("添加成功");
            this.getRoomList();
          }
          this.dialogVisible = false;
        } else {
          this.$message.error("请根据提示正确填写表单");
        }
      });
    },
    /**
     * 离店
     */
    async checkout(item) {
      console.log(item);
      const params = {
        checkinPhone: item.checkinPhone,
        id: item.id,
      };
      const res = await this.$axios.post("/api/order/checkout", params);
      if (res.code === "200") {
        this.$message.success("离店成功~");
        this.getRoomList();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.time {
  text-align: center;
  font-weight: 600;
  span {
    margin-left: 10px;
  }
}
.room-warp {
  display: flex;
  flex-wrap: wrap;
  margin-top: -1px;
  color: rgb(240, 240, 240);
  border: 1px solid #f0f0f0;
  .room-item {
    width: 200px;
    height: 100px;
    margin: 10px;
    background-color: #8395a7;
    padding: 10px;
    position: relative;
    overflow: hidden;
    &:hover .open-btn {
      display: block;
    }
    &:hover {
      background-color: #ccc;
    }
  }
}
.bd {
  border: 1px solid #f0f0f0;
  margin-top: 10px;
  padding: 16px;
}
.red {
  color: red;
}
.open-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: none;
}
.state {
  position: absolute;
  width: 100px;
  height: 50px;
  line-height: 80px;
  text-align: center;
  background: rgb(68, 68, 68);
  transform: rotate(45deg);
  left: 154px;
  top: -8px;
  font-weight: 600;
}
.state1 {
  // color: red;
}
.state2 {
  color: green;
}
</style>
