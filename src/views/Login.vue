<template>
  <div class="bg">
    <el-card class="card">
      <div class="logo">
        <img src="../assets/logo1.png" alt="" />
        <div>酒店管理系统</div>
      </div>
      <el-form
        :model="loginInfo"
        status-icon
        :rules="rules"
        ref="form"
        label-width="100px"
        class="demo-ruleForm"
        size="small"
      >
        <el-form-item label="账号：" prop="userId">
          <el-input v-model="loginInfo.userId" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="pas">
          <el-input type="password" v-model="loginInfo.pas"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginInfo: {
        userId: "",
        pas: "",
      },
      rules: {
        userId: [
          { required: true, message: "用户账号不能为空", tirgger: "blur" },
        ],
        pas: [{ required: true, message: "用户密码不能为空", tirgger: "blur" }],
      },
    };
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.login();
        } else {
          this.$message.error("请根据提示正确填写登录信息");
          return false;
        }
      });
    },
    async login() {
      const res = await this.$axios.post("/api/user/login", this.loginInfo);
      if (res.code === "200") {
        localStorage.setItem("hotelUserInfo", JSON.stringify(res.data));
        this.$message.success("登录成功~");
        this.$router.push({ name: "Home" });
      }
    },
  },
};
</script>

<style lang="less">
.bg {
  background-image: url("../assets/bg1.jpg");
  background-size: 100% 100%;
  width: 100vw;
  height: 100vh;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  width: 400px;
  padding: 16px;
  background-color: #fff;
}
.logo {
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
