<template>
  <el-card>
    <el-row class="search-warp">
      <el-form size="small" @keyup.enter.native="getRoomTypeList()">
        <el-input
          v-model="searchParams.roomTypeName"
          placeholder="请输入房型名称"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-button type="primary" size="small" @click="getRoomTypeList()"
          >查询</el-button
        >
        <el-button size="small" @click="reset()">重置</el-button>
      </el-form>
    </el-row>
    <div class="list-warp">
      <div class="table-title">
        <div class="table-name">房型列表</div>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="addBtn"
          >新增</el-button
        >
      </div>
      <div class="table-warp">
        <el-table :data="roomTypeList" border stripe v-loading="loading" :header-cell-style="headStyle">
          <el-table-column label="房型名称" min-width="200">
            <template slot-scope="scope">
              <span class="blue pointer" @click="edit(scope.row)">{{
                scope.row.roomTypeName
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="房间数" width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.roomNum }}</span>
            </template>
          </el-table-column>
          <el-table-column label="可住人数" width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.roomPeople }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="200">
            <template slot-scope="scope">
              <span :class="{ red: scope.row.state === 0 }">{{
                scope.row.state === 1 ? "已启用" : "停用"
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <span class="blue ml10 pointer" @click="edit(scope.row)"
                >编辑</span
              >
              <el-popconfirm
                :title="`确定将该房型${
                  scope.row.state === 0 ? '启用' : '停用'
                }吗?`"
                @confirm="confirmSetRoomType(scope.row)"
              >
                <span
                  class="blue ml10 pointer"
                  slot="reference"
                  :class="{ red: scope.row.state !== 0 }"
                  >{{ scope.row.state !== 1 ? "启用" : "停用" }}</span
                >
              </el-popconfirm>
              <el-popconfirm
                :title="`确定将该房型删除吗?`"
                @confirm="confirmDeleteRoom(scope.row)"
              >
                <span class="red ml10 pointer" slot="reference">删除</span>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-pagination
      @size-change="(val) => getRoomTypeList(val, 1)"
      @current-change="getRoomTypeList(searchParams.pageSize, val)"
      :current-page="searchParams.pageIndex"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="searchParams.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      class="page"
      :total="total"
    >
    </el-pagination>
    <el-dialog title="新增房型" :visible.sync="dialogVisible" width="30%">
      <el-form
        :model="roomInfo"
        ref="form"
        :rules="rules"
        label-width="120px"
        :inline="false"
        size="small"
      >
        <el-form-item label="房型名称：" prop="roomTypeName">
          <el-input v-model="roomInfo.roomTypeName"></el-input>
        </el-form-item>
        <el-form-item label="房型数量：" prop="roomNum">
          <el-input v-model="roomInfo.roomNum"></el-input>
        </el-form-item>
        <el-form-item label="可入住人数：" prop="roomPeople">
          <el-input v-model="roomInfo.roomPeople"></el-input>
        </el-form-item>
        <el-form-item label="状态：" prop="state">
          <el-radio v-model="roomInfo.state" :label="0">禁用</el-radio>
          <el-radio v-model="roomInfo.state" :label="1">开启</el-radio>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel" size="small">取 消</el-button>
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
      searchParams: {
        roomTypeName: "",
        pageSize: 10,
        pageIndex: 1,
      },
      roomInfo: {
        roomTypeName: "",
        roomNum: null,
        roomPeople: null,
        state: 1,
      },
      headStyle: {
        background: "#dfe4ea",
      },
      activeName: "1",
      loading: true,
      roomTypeList: [],
      total: 0,
      dialogVisible: false,
      rules: {
        roomTypeName: [
          { required: true, message: "房型名称不能为空", tiggeer: "blur" },
        ],
        roomNum: [
          {
            required: true,
            validator: (rules, value, callback) => {
              const reg = /^[0-9]*[1-9][0-9]*$/;
              if (!reg.test(value)) {
                callback(new Error("房间数只能是正整数~"));
              } else {
                callback();
              }
            },
            tiggeer: "bulr",
          },
        ],
        roomPeople: [
          {
            required: true,
            validator: (rules, value, callback) => {
              const reg = /^[0-9]*[1-9][0-9]*$/;
              if (!reg.test(value)) {
                callback(new Error("入住人数只能是整数~"));
              } else {
                callback();
              }
            },
            tiggeer: "bulr",
          },
        ],
      },
    };
  },
  mounted() {
    this.getRoomTypeList();
    this.activeName = this.$route.query.activeName || "1";
  },
  methods: {
    async getRoomTypeList() {
      const params = {
        ...this.searchParams
      }
      this.loading = true;
      const res = await this.$axios.post("/api/hotel/getRoomTypeList",params);
      if (res) {
        this.roomTypeList = res.data;
        this.total = res.total;
      }
      this.loading = false;
    },
    /** 确认设置房型 */
    async confirmAdd() {
      this.$refs.form.validate((voild) => {
        if (voild) {
          this.save();
        } else {
          this.$message.error("请根据表单提示正确的填写表单内容~");
        }
      });
    },
    async save() {
      const params = {
        ...this.roomInfo,
      };
      const res = await this.$axios.post("/api/hotel/addRoom", params);
      if (res.code === "200") {
        this.$message.success( `${params.id ? "编辑成功" : "新增成功"}`);
        this.dialogVisible = false;
        this.getRoomTypeList();
      }
    },
    /** 删除房型 */
    async confirmDeleteRoom(row) {
      const params = {
        id: row.id,
      };
      const res = await this.$axios.post("/api/hotel/deleteRoom", params);
      if (res.code === "200") {
        this.getRoomTypeList();
        this.$message.success("删除成功");
      }
    },
    /** 修改当前房型状态 */
    async confirmSetRoomType(row) {
      const params = {
        id: row.id,
        state: row.state === 0 ? 1 : 0,
      };
      const res = await this.$axios.post("/api/hotel/updateState", params);
      if (res.code === "200") {
        this.getRoomTypeList();
        this.$message.success(
          `${row.state === 0 ? "房型已开启" : "房型已暂停"}`
        );
      }
    },
    cancel() {
      this.dialogVisible = false;
      this.roomInfo = {
        roomTypeName: "",
        roomNum: null,
        roomPeople: null,
        state: 1,
      };
    },
    reset() {
      this.searchParams = {
        roomTypeName: "",
        pageSize: 10,
        pageIndex: 1,
      };
      this.getRoomTypeList();
    },
    async edit(row) {
      this.dialogVisible = true;
      const params = {
        id: row.id,
      };
      const res = await this.$axios.post("/api/hotel/getRoomById", params);
      if (res.code === "200") {
        this.roomInfo = res.data;
      }
    },
    addBtn() {
      this.dialogVisible = true;
      this.roomInfo = {
        roomTypeName: "",
        roomNum: null,
        roomPeople: null,
        state: 1,
      };
    }
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
