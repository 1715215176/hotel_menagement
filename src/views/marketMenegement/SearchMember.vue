<template>
  <div>
    <el-card shadow="never">
      <div class="member-search-container">
        <h2 class="mb20">会员查询</h2>
        <div class="search-input">
          <el-input
            clearable
            @keydown.enter.native="search"
            v-model="checkinPhone"
            placeholder="请输入会员手机号码"
          >
            <el-button slot="append" type="primary" @click="search"
              >搜索</el-button
            >
          </el-input>
        </div>
        <div class="img-show">
          <img src="@/assets/1.png" class="mt50" style="width: 440px" />
        </div>
      </div>
      <el-table
        v-if="memberInfo.length > 0"
        :data="memberInfo"
        border
        stripe
        :header-cell-style="headStyle"
      >
        <el-table-column prop="memberNo" label="会员号" />
        <el-table-column prop="memebrPhone" label="会员手机号" />
        <el-table-column prop="upgrade" label="剩余升级天数" />
        <el-table-column label="当前会员等级">
          <template slot-scope="scope">
            <span class="mr10">{{ getMember(scope.row) }}</span>
            <el-button type="text" @click="dialogVisible = true">
              升级会员卡</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-dialog title="购买会员卡" :visible.sync="dialogVisible">
        <el-table :data="tableData" border stripe width="600px">
          <el-table-column prop="cradName" label="会员卡名称" />
          <el-table-column prop="cradFlag" label="会员卡等级" />
          <el-table-column prop="upgrade" label="需升级房晚" />
          <el-table-column prop="price" label="售价" />
          <el-table-column label="折扣">
            <template slot-scope="scope">
              <span>{{ scope.row.discount }}折</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-popconfirm
                title="确定购买会员卡吗？"
                @confirm="buy(scope.row)"
                v-if="Number(scope.row.cradNum) > Number(memberInfo[0].level)"
              >
                <el-button type="text" slot="reference">购买</el-button>
              </el-popconfirm>
              <el-button type="text" v-else>以达到该等级</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkinPhone: "",
      memberInfo: [],
      headStyle: {
        background: "#dfe4ea",
      },
      tableData: [],
      dialogVisible: false,
    };
  },
  mounted() {
    this.getMemberCard();
  },
  methods: {
    async search() {
      if (!this.checkinPhone) return this.$message.error("请输入手机号");
      if (!/^1[3456789]\d{9}$/.test(this.checkinPhone)) {
        return this.$message.error("请输入正确的手机号");
      }
      const res = await this.$axios.post("/api/order/getMemberInfo", {
        checkinPhone: this.checkinPhone,
      });
      if (res.code === "200" && res.data) {
        this.memberInfo = [res.data];
      }
    },
    async getMemberCard() {
      const res = await this.$axios.post("/api/card/getMemberCard", {});
      if (res.code === "200") {
        this.tableData = res.data;
      }
    },
    getMember(row) {
      const obj = this.tableData.find((v) => v.cradNum === row.level);
      if (obj) {
        return obj.cradName;
      }
    },
    async buy(row) {
      const params = {
        checkinPhone: this.checkinPhone,
        level: row.cradNum,
        upgrade: row.upgrade,
      };
      const res = await this.$axios.post("/api/card/buy", params);
      if (res.code === "200") {
        this.$message.success("会员卡购买成功");
        this.dialogVisible = false;
        this.search();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.member-search-container {
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .el-input {
    width: 440px;
  }
  .el-button {
    color: #ffffff;
    border-radius: 0;
    background-color: #2d8cf0;
  }
}
.el-pagination {
  text-align: right;
}
</style>
