<template>
  <el-card shadow="never">
    <span slot="header">会员卡列表</span>
    <el-table :data="tableData" border stripe>
      <el-table-column prop="cradName" label="会员卡名称" />
      <el-table-column prop="cradFlag" label="会员卡等级" />
      <el-table-column prop="upgrade" label="需升级房晚" />
      <el-table-column prop="price" label="售价" />
      <el-table-column label="折扣">
        <template slot-scope="scope">
          <span>{{ scope.row.discount }}折</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="(val) => getMemberCard(val, 1)"
      @current-change="getMemberCard(searchParams.pageSize, val)"
      :page-sizes="[10, 20, 30, 40]"
      layout="total, sizes, prev, pager, next, jumper"
      class="page"
      :total="total"
    ></el-pagination>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      total: 0,
    };
  },
  mounted() {
    this.getMemberCard();
  },
  methods: {
    async getMemberCard() {
      const res = await this.$axios.post("/api/order/getMemberCard", {});
      if (res.code === "200") {
        this.tableData = res.data;
        this.total = res.total;
      }
    },
  },
};
</script>

<style></style>
