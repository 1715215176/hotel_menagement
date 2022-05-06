<template>
  <el-card>
    <el-row class="search-warp">
      <el-form size="small" @keyup.enter.native="getUserList()">
        <el-input
          v-model="searchParams.roomTypeName"
          placeholder="请输入用户名称"
          size="small"
          clearable
          class="w200 mr10"
        ></el-input>
        <el-button type="primary" size="small" @click="getUserList()"
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
        <el-table
          :data="userList"
          border
          stripe
          v-loading="loading"
          :header-cell-style="headStyle"
        >
          <el-table-column label="用户名称" min-width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用户账号" width="200">
            <template slot-scope="scope">
              <span>{{ scope.row.userId }}</span>
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
            width="300"
            fixed="right"
          >
            <template slot-scope="scope">
              <span
                class="blue ml10 pointer"
                @click="privilegeChange(scope.row)"
                >权限</span
              >
              <span class="blue ml10 pointer" @click="edit(scope.row)"
                >重置密码</span
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
      @size-change="(val) => getUserList(val, 1)"
      @current-change="getUserList(searchParams.pageSize, val)"
      :current-page="searchParams.pageIndex"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="searchParams.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      class="page"
      :total="total"
    >
    </el-pagination>
    <el-dialog title="新增用户" :visible.sync="dialogVisible" width="30%">
      <el-form
        :model="userInfo"
        ref="form"
        :rules="rules"
        label-width="120px"
        :inline="false"
        size="small"
      >
        <el-form-item label="用户名称：" prop="userName">
          <el-input v-model="userInfo.userName"></el-input>
        </el-form-item>
        <el-form-item label="用户账号：" prop="userId">
          <el-input v-model="userInfo.userId"></el-input>
        </el-form-item>
        <el-form-item label="用户密码：" prop="password">
          <el-input v-model="userInfo.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="状态：" prop="state">
          <el-radio v-model="userInfo.state" :label="0">禁用</el-radio>
          <el-radio v-model="userInfo.state" :label="1">开启</el-radio>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel" size="small">取 消</el-button>
        <el-button type="primary" size="small" @click="confirmAdd"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      title="数据权限"
      :visible.sync="privilegeDialogVisible"
      width="30%"
    >
      <el-tree
        :data="privilegeTree"
        :default-expanded-keys="privilegeList"
        :default-checked-keys="privilegeList"
        highlight-current
        ref="tree"
        show-checkbox
        node-key="name"
        :props="{
          children: 'children',
          label: 'titleName',
        }"
      >
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="privilegeDialogVisible = false" size="small"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="confirmPrivilege"
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
      userInfo: {
        userName: "",
        userId: null,
        password: null,
        state: 1,
      },
      headStyle: {
        background: "#dfe4ea",
      },
      activeName: "1",
      loading: true,
      userList: [],
      total: 0,
      dialogVisible: false,
      privilegeDialogVisible: false,
      privilegeTree: [],
      privilegeList: [],
      rules: {
        userName: [
          { required: true, message: "用户名称不能为空", tiggeer: "blur" },
        ],
        userId: [
          { required: true, message: "用户账号不能为空", tiggeer: "blur" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", tiggeer: "blur" },
        ],
      },
    };
  },
  mounted() {
    this.getUserList();
    this.privilegeTree = this.getTreeName(this.$router.options.routes);

    const index = this.privilegeTree.findIndex((v) => v.name === "Login");
    if (index > -1) {
      this.privilegeTree.splice(index, 1);
    }
    this.activeName = this.$route.query.activeName || "1";
  },
  methods: {
    getTreeName(tree) {
      tree.forEach((item) => {
        item.titleName = item.meta.title;
        if (item.children && item.children.length > 0) {
          this.getTreeName(item.children);
        }
      });
      return tree;
    },
    async getUserList() {
      const params = {
        ...this.searchParams,
      };
      this.loading = true;
      const res = await this.$axios.post("/api/user/getUserList", params);
      if (res) {
        this.userList = res.data;
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
        ...this.userInfo,
      };
      const res = await this.$axios.post("/api/user/addUser", params);
      if (res.code === "200") {
        this.$message.success(`${params.id ? "编辑成功" : "新增成功"}`);
        this.dialogVisible = false;
        this.getUserList();
      }
    },
    /** 删除用户 */
    async confirmDeleteRoom(row) {
      const params = {
        id: row.id,
      };
      const res = await this.$axios.post("/api/user/deleteUser", params);
      if (res.code === "200") {
        this.getUserList();
        this.$message.success("删除成功");
      }
    },
    /** 修改当前账号状态 */
    async confirmSetRoomType(row) {
      const params = {
        id: row.id,
        state: row.state === 0 ? 1 : 0,
      };
      const res = await this.$axios.post("/api/user/updateState", params);
      if (res.code === "200") {
        this.getUserList();
        this.$message.success(`${row.state === 0 ? "已开启" : "已暂停"}`);
      }
    },
    cancel() {
      this.dialogVisible = false;
      this.userInfo = {
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
      this.getUserList();
    },
    async edit(row) {
      const params = {
        id: row.id,
      };
      const res = await this.$axios.post("/api/user/repassword", params);
      if (res.code === "200") {
        this.$message.success('重置成功密码为 123')
      }
    },
    addBtn() {
      this.dialogVisible = true;
      this.userInfo = {
        roomTypeName: "",
        roomNum: null,
        roomPeople: null,
        state: 1,
      };
    },
    /** 点击权限 */
    async privilegeChange(row) {
      this.privilegeList = [];
      this.curRow = row;
      this.privilegeDialogVisible = true;
      const res = await this.$axios.post("/api/user/getUserPrivilege", {
        id: this.curRow.id,
      });
      if (res.code === "200") {
        this.$nextTick(() => {
          this.privilegeList = (res.data.privilegeList && res.data.privilegeList.split(",")) || [];
          this.$refs.tree.setCheckedKeys(this.privilegeList);
        });
      }
    },
    handleCheckChange() {},
    /** 确定添加权限 */
    async confirmPrivilege() {
      const node = this.getSelectNode(
        this.$refs.tree.getCheckedNodes(true, true)
      );
      const params = {
        id: this.curRow.id,
        node,
      };
      const res = await this.$axios.post("/api/user/savePrivilege", params);
      if (res.code === "200") {
        this.$message.success("权限保存成功~");
        this.privilegeDialogVisible = false;
        this.getUserList();
      }
    },
    getSelectNode(tree, result = []) {
      console.log(tree);
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i];
        if (item.name) {
          result.push(item.name);
        }
        if (item.children && item.children.length > 0) {
          this.getSelectNode(item.children, result);
        }
      }
      return result.join(",");
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
