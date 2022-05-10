<template>
  <el-container class="main">
    <el-aside width="200px">
      <div class="logo">
        <img src="../assets/logo1.png" alt="" />
        <div>酒店管理系统</div>
      </div>
      <el-menu
        :default-active="activeName"
        class="el-menu-vertical-demo"
        @select="handleOpen"
        background-color="#2f3542"
        text-color="#ccc"
        active-text-color="#8395a7"
      >
        <template v-if="menuList && menuList.length > 0">
          <template v-for="(item, index) in menuList">
            <el-submenu
              :key="index"
              :index="item.name"
              v-if="item.meta.showInMenu"
            >
              <template slot="title">
                <i :class="item.meta.icon"></i>
                <span>{{ item.meta.title }}</span>
              </template>
              <template v-for="element in item.children">
                <el-menu-item
                  v-if="element.meta.showInMenu"
                  :key="element.path"
                  :index="element.name"
                  >{{ element.meta.title || "" }}</el-menu-item
                >
              </template>
            </el-submenu>
          </template>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumb"
            :key="index"
            >{{ item.title }}</el-breadcrumb-item
          >
        </el-breadcrumb>
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userInfo.name }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goOut">退出登录</el-dropdown-item>
            <el-dropdown-item @click.native="changePswDialogVisible = true"
              >修改密码</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
    <el-dialog
      title="修改密码"
      :close-on-click-modal="false"
      :visible.sync="changePswDialogVisible"
      width="480px"
    >
      <el-form
        :model="formPws"
        ref="pwsRef"
        :rules="pwsRules"
        label-width="100px"
        size="small"
      >
        <el-form-item label="当前密码:" prop="oldPassword">
          <el-input
            type="password"
            autocomplete
            v-model="formPws.oldPassword"
            placeholder="请输入当前密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码:" prop="nPassword">
          <el-input
            type="password"
            autocomplete
            v-model="formPws.nPassword"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="重复新密码:" prop="repeatPws">
          <el-input
            type="password"
            autocomplete
            v-model="formPws.repeatPws"
            placeholder="请重复新密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="changePswDialogVisible = false"
          >取消</el-button
        >
        <el-button size="small" type="primary" @click="pwsSave">保存</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      activeName: "",
      menuList: [],
      breadcrumb: [],
      userInfo: {},
      changePswDialogVisible: false,
      formPws: {
        oldPassword: "", // 当前密码
        nPassword: "", // 新密码
        repeatPws: "", // 重复新密码
      },
      pwsRules: {
        oldPassword: [
          {
            type: "string",
            required: true,
            message: "旧密码不能为空",
            trigger: "blur",
          },
        ],
        nPassword: [
          {
            type: "string",
            required: true,
            validator: (rule, value, callback) => {
              if (value) {
                let flag =
                  /^.*(?=.{8,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*$/.test(value);
                if (!flag) {
                  callback(
                    new Error("密码长度为8-16位，必须包含大小写字母和数字")
                  );
                } else {
                  callback();
                }
              } else {
                if (rule.required) {
                  callback(new Error("必须输入密码"));
                } else {
                  callback();
                }
              }
            },
            trigger: "blur",
          },
        ],
        repeatPws: [
          {
            type: "string",
            required: true,
            validator: (rule, value, callback) => {
              if (!value || value === undefined || value.length === 0) {
                callback(new Error("重复新密码不能为空"));
              } else if (value != this.formPws.nPassword) {
                callback(new Error("重复密码必须与新密码一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    this.activeName = localStorage.getItem("activeName") || "Home";
    this.breadcrumb = this.getTree(this.activeName);
    this.$nextTick(() => {
      this.menuList = JSON.parse(JSON.stringify(this.$router.options.routes));
      this.userInfo = JSON.parse(localStorage.getItem("hotelUserInfo"));
      this.getPrivilegeList();
    });
  },
  methods: {
    /** 菜单栏点击 */
    handleOpen(e) {
      localStorage.setItem("activeName", e);
      this.activeName = e;
      this.breadcrumb = this.getTree(this.activeName);
      this.$router.push({ name: e });
    },
    getTree(name, tree = this.menuList, result = []) {
      const len = tree.length;
      for (let i = 0; i < len; i++) {
        const item = tree[i];
        result.push({
          name: item.name,
          title: item.meta.title,
        });
        if (item.name === name) {
          return result;
        }
        if (item.children && item.children.length > 0) {
          const res = this.getTree(name, item.children, result);
          if (res) {
            return res;
          }
          result.pop();
        } else {
          result.pop();
        }
      }
    },
    goOut() {
      localStorage.removeItem("hotelUserInfo");
      this.$router.push({ name: "Login" });
    },
    getPrivilegeList() {
      const privilegeList = this.userInfo.privilegeList.split(",");
      this.menuList.forEach((item) => {
        if (item.children && item.children.length > 0) {
          item.children.forEach((element) => {
            const flag = privilegeList.includes(element.name);
            if (!flag) {
              element.meta.showInMenu = false;
            }
          });
        }
      });
      this.menuList.forEach((item) => {
        if (item.children && item.children.length > 0) {
          const flag = item.children.every((v) => !v.meta.showInMenu);
          if (flag) {
            item.meta.showInMenu = false;
          }
        }
      })
    },
    async pwsSave() {
      const params = {
        userId: this.userInfo.userId,
        password: this.formPws.nPassword,
        oldPas: this.formPws.oldPassword,
      };
      const res = await this.$axios.post("/api/user/changePas", params);
      if (res.code === "200") {
        this.$message.success("修改密码成功~");
        this.changePswDialogVisible = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.main {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #f0f0f0;
  .el-aside {
    background: #2f3542;
    .el-menu {
      border: 0;
    }
  }
}
.el-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.el-main {
  padding: 16px;
}
.logo {
  color: rgb(255, 255, 255);
  height: 60px;
  line-height: 60px;
  position: relative;
  display: flex;
  align-items: center;
  img {
    width: 60px;
    height: 40px;
  }
}
</style>
