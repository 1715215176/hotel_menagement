<template>
  <el-card>
    <el-row class="search-warp">
      <el-form size="small" @keyup.enter.native="getOrderList()">
        <el-input
          v-model="searchParams.orderId"
          placeholder="订单编号"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-input
          v-model="searchParams.checkinPeople"
          placeholder="入住人"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-input
          v-model="searchParams.checkinPhone"
          placeholder="手机号"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-select
          v-model="searchParams.roomType"
          size="small"
          placeholder="入住类型"
          class="w200 mr10"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select v-model="searchParams.isOut" size="small" placeholder="状态">
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button type="primary" size="small" @click="getOrderList()"
          >查询</el-button
        >
        <el-button size="small" @click="reset()">重置</el-button>
      </el-form>
    </el-row>
    <div class="list-warp">
      <div class="table-title">
        <div class="table-name">全部订单</div>
      </div>
      <div class="table-warp">
        <el-table
          :data="roomTypeList"
          border
          stripe
          v-loading="loading"
          id="el-table"
          :header-cell-style="headStyle"
          height="600px"
        >
          <el-table-column label="订单编号" min-width="200" prop="orderId" />
          <el-table-column
            label="房型名称"
            min-width="150"
            prop="roomTypeName"
          />
          <el-table-column label="房间号" min-width="100" prop="roomNo" />
          <el-table-column
            label="入住人"
            min-width="100"
            prop="checkinPeople"
          />
          <el-table-column label="手机号" width="150" prop="checkinPhone" />
          <el-table-column label="价钱" width="100" prop="price" />
          <el-table-column label="会员等级" width="150">
            <template slot-scope="scope">
              <el-tag type="info" v-if="scope.row.level === 1">白银卡</el-tag>
              <el-tag type="success" v-if="scope.row.level === 2">金卡</el-tag>
              <el-tag type="warning" v-if="scope.row.level === 3"
                >铂金卡</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="会员卡号" width="150" prop="memberNo" />
          <el-table-column label="入住时间" width="150">
            <template slot-scope="scope">
              {{ $moment(scope.row.checkinDate).format("YYYY-MM-DD") }}
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.roomType === 1 ? "全日房" : "钟点房" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="small"
                v-if="scope.row.isOut === 1"
                @click="checkout(scope.row)"
                >离店</el-button
              >
              <el-button size="small" v-else>已离店</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-pagination
      @size-change="(val) => getOrderList(val, 1)"
      @current-change="getOrderList(searchParams.pageSize, val)"
      :current-page="searchParams.pageIndex"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="searchParams.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      class="page"
      :total="total"
    >
    </el-pagination>
    <el-dialog title="订单" :visible.sync="dialogVisible" width="30%">
      <el-form
        :model="curRow"
        ref="form"
        label-width="120px"
        :inline="false"
        size="small"
      >
        <el-form-item label="订单编号：">
          <span>{{ curRow.orderId }}</span>
        </el-form-item>
        <el-form-item label="房型名称：">
          <span>{{ curRow.roomTypeName }}</span>
        </el-form-item>
        <el-form-item label="房间号：">
          <span>{{ curRow.roomNo }}</span>
        </el-form-item>
        <el-form-item label="入住人：">
          <span>{{ curRow.checkinPeople }}</span>
        </el-form-item>
        <el-form-item label="手机号：">
          <span>{{ curRow.checkinPhone }}</span>
        </el-form-item>
        <el-form-item label="价钱：">
          <span>{{ curRow.price }}</span>
        </el-form-item>
        <el-form-item label="会员等级：">
          <el-tag type="info" v-if="curRow.level === 1">白银卡</el-tag>
          <el-tag type="success" v-if="curRow.level === 2">金卡</el-tag>
          <el-tag type="warning" v-if="curRow.level === 3">铂金卡</el-tag>
        </el-form-item>
        <el-form-item label="会员卡号：">
          <span>{{ curRow.memberNo }}</span>
        </el-form-item>
        <el-form-item label="入住时间：">
          <span>{{ curRow.checkinDate }}</span>
        </el-form-item>
        <el-form-item label="类型：">
          <span>{{ curRow.roomType === 1 ? "全日房" : "钟点房" }}</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="confirmAdd"
          >确认离店</el-button
        >
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      searchParams: {
        checkinPeople: "",
        orderId: "",
        isOut: null,
        roomType: null,
        pageSize: 10,
        pageIndex: 1,
      },
      roomInfo: {},
      activeName: "1",
      loading: true,
      roomTypeList: [],
      total: 0,
      curRow: {},
      dialogVisible: false,
      headStyle: {
        background: "#dfe4ea",
      },
      typeList: [
        { label: "全日房", value: 1 },
        { label: "钟点房", value: 2 },
      ],
      stateList: [
        { label: "已离店", value: 0 },
        { label: "未离店", value: 1 },
      ],
    };
  },
  mounted() {
    this.getOrderList();
    this.activeName = this.$route.query.activeName || "1";
  },
  methods: {
    async getOrderList() {
      const params = {
        ...this.searchParams,
      };
      this.loading = true;
      const res = await this.$axios.post("/api/order/getOrderList", params);
      if (res) {
        this.roomTypeList = res.data;
        this.total = res.total;
      }
      this.loading = false;
    },
    reset() {
      this.searchParams = {
        checkinPeople: "",
        orderId: "",
        isOut: null,
        roomType: null,
        pageSize: 10,
        pageIndex: 1,
      };
      this.getOrderList();
    },
    checkout(row) {
      this.curRow = row;
      this.dialogVisible = true;
    },
    /**
     * 离店
     */
    async confirmAdd() {
      const params = {
        checkinPhone: this.curRow.checkinPhone,
        roomNo: this.curRow.roomNo,
        orderId: this.curRow.orderId,
      };
      const res = await this.$axios.post("/api/order/checkout", params);
      if (res.code === "200") {
        this.$message.success("离店成功~");
        this.getOrderList();
        this.dialogVisible = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.common {
  font-size: 14px;
}
.search-warp {
  border: 1px solid #f0f0f0;
  padding: 16px;
}
.list-warp {
  margin-top: 20px;
  border: 1px solid #f0f0f0;
}
.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.table-warp {
  padding: 16px;
}
.el-table {
  border: 1px solid #f0f0f0;
}
.page {
  text-align: right;
  margin-top: 10px;
}
.blue {
  color: rgb(45, 140, 240);
}
.red {
  color: rgb(237, 80, 80);
}
.pointer {
  cursor: pointer;
}
.w200 {
  width: 200px;
}
::v-deep .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
}
::v-deep .el-dialog__footer {
  border-top: 1px solid #f0f0f0;
}
::v-deep .el-dialog__body {
  padding: 20px 30px;
}
</style>
