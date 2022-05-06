<template>
  <el-card shadow="never">
    <el-row class="search-warp">
      <el-form @keyup.enter.native="getFloorRoom()">
        <el-input
          v-model="searchParams.roomNo"
          placeholder="请输入房间号"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-select
          v-model="searchParams.roomTypeId"
          placeholder="请选择房型"
          clearable
          filterable
          size="small"
          class="w200 mr10"
        >
          <el-option
            v-for="item in roomTypeList"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-select
          v-model="searchParams.state"
          placeholder="状态"
          clearable
          filterable
          size="small"
          class="w100 mr10"
        >
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <el-button type="primary" size="small" @click="getFloorRoom()"
          >查询</el-button
        >
        <el-button size="small" @click="reset()">重置</el-button>
      </el-form>
    </el-row>
    <div class="right-warp">
      <div class="table-title">
        <div class="table-name">房间列表</div>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="addBtn()"
          >新增</el-button
        >
      </div>
      <div class="table-warp">
        <el-table :data="roomList" border stripe v-loading="loading" :header-cell-style="headStyle">
          <el-table-column label="序号" min-width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.roomNo }}</span>
            </template>
          </el-table-column>
          <el-table-column label="房型名称" min-width="180">
            <template slot-scope="scope">
              <span>{{ scope.row.roomTypeName }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column label="床型" min-width="100">
            <template slot-scope="scope">
              <span>{{ getBedType(scope.row) }}</span>
            </template>
          </el-table-column> -->
          <el-table-column label="卫浴" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.isBathroom === 0 ? "无" : "有" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="窗户" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.isWindow === 0 ? "无窗" : "有窗" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="空调" min-width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.isAir === 0 ? "无" : "有" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template slot-scope="scope">
              <span :class="{ red: scope.row.state === 0 }">{{
                scope.row.state === 0 ? "已停用" : "启用"
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="全日房售价" min-width="100">
            <template slot-scope="scope">
              <span class="red">￥{{ scope.row.price || "--" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="钟点房售价" min-width="100">
            <template slot-scope="scope">
              <span class="red">￥{{ scope.row.hourPrice || "--" }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="180"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <span class="blue ml10 pointer" @click="edit(scope.row)"
                >编辑</span
              >
              <span class="blue ml10 pointer" @click="edit(scope.row, 'copy')"
                >复制</span
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
        <el-pagination
          @size-change="(val) => getFloorRoom(val, 1)"
          @current-change="(val) => getFloorRoom(searchParams.pageSize, val)"
          :current-page="searchParams.pageIndex"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="searchParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          class="page"
          :total="total"
        >
        </el-pagination>
        <el-dialog title="新增房型" :visible.sync="dialogVisible" width="500px">
          <el-form
            :model="roomInfo"
            ref="form"
            :rules="rules"
            label-width="120px"
            :inline="false"
            size="small"
          >
            <el-form-item label="房间号：" prop="roomNo">
              <el-input v-model="roomInfo.roomNo" class="w200"></el-input>
            </el-form-item>
            <el-form-item label="所属房型：" prop="roomTypeId">
              <el-select
                v-model="roomInfo.roomTypeId"
                placeholder="请选择"
                clearable
                filterable
                size="small"
                class="w200"
              >
                <el-option
                  v-for="item in roomTypeList"
                  :key="item.id"
                  :label="item.roomTypeName"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="窗户：" prop="isWindow">
              <el-select
                v-model="roomInfo.isWindow"
                placeholder="请选择"
                clearable
                filterable
                size="small"
                class="w200"
              >
                <el-option
                  v-for="item in hasWindowList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="卫浴：" prop="isBathroom">
              <el-select
                v-model="roomInfo.isBathroom"
                placeholder="请选择"
                clearable
                filterable
                size="small"
                class="w200"
              >
                <el-option
                  v-for="item in bathroomList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="空调：" prop="isAir">
              <el-select
                v-model="roomInfo.isAir"
                placeholder="请选择"
                clearable
                filterable
                size="small"
                class="w200"
              >
                <el-option
                  v-for="item in airConditioningList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="价钱：" prop="price">
              <el-input v-model="roomInfo.price" class="w200"></el-input>
            </el-form-item>
            <el-form-item label="钟点房价钱：" prop="hourPrice">
              <el-input v-model="roomInfo.hourPrice" class="w200"></el-input>
            </el-form-item>
            <el-form-item label="状态：" prop="state">
              <el-radio v-model="roomInfo.state" :label="0">禁用</el-radio>
              <el-radio v-model="roomInfo.state" :label="1">开启</el-radio>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false" size="small"
              >取 消</el-button
            >
            <el-button type="primary" size="small" @click="confirmAdd"
              >确 定</el-button
            >
          </span>
        </el-dialog>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      searchParams: {
        floorId: "",
        roomNo: "",
        productType: "",
        roomTypeId: "",
        state: "",
        pageSize: 10,
        pageIndex: 1,
      },
      headStyle: {
        background: "#dfe4ea",
      },
      rules: {
        roomNo: [
          { required: true, message: "房间号不能为空", trigger: "blur" },
        ],
        roomTypeName: [
          { required: true, message: "所属房型不能为空", trigger: "change" },
        ],
        isWindow: [
          { required: true, message: "请选择是否有窗户", trigger: "change" },
        ],
        isBathroom: [
          { required: true, message: "请选择是否有卫浴", trigger: "change" },
        ],
        isAir: [
          { required: true, message: "请选择是否有空调", trigger: "change" },
        ],
        state: [
          { required: true, message: "请选择房间状态", trigger: "change" },
        ],
        price: [
          {
            required: true,
            validator: (rule, value, callba) => {
              const reg = /^[0-9]*[1-9][0-9]*$/;
              if (!reg.test(value)) {
                callba(new Error("请输入正整数"));
              } else {
                callba();
              }
            },
            trigger: "blur",
          },
        ],
        hourPrice: [
          {
            required: true,
            validator: (rule, value, callba) => {
              const reg = /^[0-9]*[1-9][0-9]*$/;
              if (!reg.test(value)) {
                callba(new Error("请输入正整数"));
              } else {
                callba();
              }
            },
            trigger: "blur",
          },
        ],
      },
      roomTypeList: [],
      stateList: [
        { label: "启用", value: 1 },
        { label: "停用", value: 0 },
      ],
      hasWindowList: [
        { label: "无窗", value: 0 },
        { label: "有窗", value: 1 },
      ],
      airConditioningList: [
        { label: "无", value: 0 },
        { label: "有", value: 1 },
      ],
      bathroomList: [
        { label: "无", value: 0 },
        { label: "有独立卫浴", value: 1 },
      ],
      dialogVisible: false,
      roomList: [],
      roomInfo: {
        roomNo: "",
        roomTypeName: "",
        roomTypeId: null,
        isWindow: "",
        isBathroom: "",
        isAir: "",
        price: "",
        state: 0,
        hourPrice: null,
      },
      total: 0,
      loading: false,
    };
  },
  mounted() {
    this.getRoomList();
    this.getRoomTypeList();
    // this.getBedNameList();
    // this.getFloorRoom();
  },
  methods: {
    /**房型列表 */
    async getRoomTypeList() {
      const res = await this.$axios.post("/api/hotel/getRoomTypeList");
      if (res.code === "200") {
        this.roomTypeList = res.data;
      }
    },
    /** 全部房间 */
    async getRoomList() {
      const params = {
        ...this.searchParams,
      };
      this.loading = true;
      const res = await this.$axios.post("/api/room/getRoomList", params);
      if (res) {
        this.roomList = res.data;
        this.total = res.total;
      }
      this.loading = false;
    },
    /** 修改房间状态  */
    async confirmSetRoomType(row) {
      const params = {
        id: row.id,
        state: row.state === 0 ? 1 : 0,
      };
      const res = await this.$axios.post("/api/room/updateState", params);
      if (res.code === "200") {
        this.getRoomList();
        this.$message.success(
          `${row.state === 0 ? "房型已开启" : "房型已暂停"}`
        );
      }
    },
    /** 确认添加楼层 */
    confirmAdd() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const params = JSON.parse(JSON.stringify(this.roomInfo));
          const obj = this.roomTypeList.find(
            (item) => item.id === params.roomTypeId
          );
          params.roomTypeName = obj.roomTypeName;
          const res = await this.$axios.post("/api/room/addRoom", params);
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
    async confirmDeleteRoom(row) {
      const params = {
        id: row.id,
      };
      const res = await this.$axios.post("/api/room/deleteRoom", params);
      if (res.code === "200") {
        this.getRoomList();
        this.$message.success("删除成功");
      }
    },
    addBtn() {
      this.dialogVisible = true;
      this.roomInfo = {
        roomNo: "",
        roomTypeName: "",
        isWindow: "",
        isBathroom: "",
        isAir: "",
        price: "",
        state: "",
        hourPrice: null,
      };
    },
    reset() {
      this.searchParams = {
        floorId: "",
        roomNo: "",
        productType: "",
        roomTypeId: "",
        state: "",
        pageSize: 10,
        pageIndex: 1,
      };
      this.getFloorRoom();
    },
    /** 添加楼层房间 */
    async edit(row, type) {
      const res = await this.$axios.post("/api/room/getRoomById", {
        id: row.id,
      });
      if (res.code === "200") {
        this.dialogVisible = true;
        this.roomInfo = JSON.parse(JSON.stringify(res.data));
        if (type === "copy") {
          this.roomInfo.id = null;
        }
        this.getRoomList();
      }
    },
    /** 复制 */
    copy(row) {
      this.$router.push({
        name: "floorDetail",
        query: {
          hotelId: this.hotelId,
          hotelName: this.hotelName,
          id: row.id,
          type: "copy",
        },
      });
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
.el-tree {
  font-size: 14px;
}
.right-warp {
  border: 1px solid #f0f0f0;
  margin-top: 10px;
}
.add-btn {
  font-weight: 900;
  font-size: 18px;
  margin-left: 20px;
  color: blue;
}
.remove-btn {
  position: absolute;
  /* right: 0; */
  font-size: 14px;
  right: 0px;
  color: red;
  margin-top: -4px;
}
.common {
  font-size: 14px;
}
.search-warp {
  border: 1px solid #f0f0f0;
  padding: 16px;
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
::v-deep .el-input-number.is-controls-right .el-input__inner {
  text-align: left;
}
::v-deep .el-dialog__header {
  border-bottom: 1px solid #f0f0f0;
}
::v-deep .el-dialog__footer {
  border-top: 1px solid #f0f0f0;
}
.w200 {
  width: 200px;
}
</style>
