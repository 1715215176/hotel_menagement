<template>
  <div class="main">
    <div class="base-info-warp">
      <div class="base-info-item">
        <div><i class="el-icon-user-solid person"></i></div>
        <div class="info">
          <div class="info-text">当日入住人数</div>
          <div class="number">{{ baseInfo.curNumberTotal || "暂无" }}</div>
        </div>
      </div>
      <div class="base-info-item">
        <div><i class="el-icon-notebook-1 person"></i></div>
        <div class="info">
          <div class="info-text">当日营业额</div>
          <div class="number">{{ baseInfo.curMoney || "0" }}</div>
        </div>
      </div>
      <div class="base-info-item">
        <div><i class="el-icon-office-building person"></i></div>
        <div class="info">
          <div class="info-text">剩余房型库存</div>
          <div class="number">{{ stock }}</div>
        </div>
      </div>
      <div class="base-info-item">
        <div><i class="el-icon-s-check person"></i></div>
        <div class="info">
          <div class="info-text">已有会员人数</div>
          <div class="number">{{ haveMember }}</div>
        </div>
      </div>
    </div>
    <div id="echarts"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      baseInfo: {
        curNumberTotal: null,
        curMoney: null,
      },
      dateList: [],
      stock: null,
      haveMember: null,
      echartsDate: [],
    };
  },
  async mounted() {
    this.initDate();
    this.getHomeBaseInfo();
    this.getRoomList();
    this.getMemberInfo();
    await this.getHomeDetail();
    this.init();
  },
  methods: {
    init() {
      const myEcharts = echarts.init(document.getElementById("echarts"));
      let option = {
        title: {
          text: "各房型日收入对比图",
          textStyle: {
            color: "#1c2c3f",
          },
          top: "10px",
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["商务双床房", "城市套房", "商务大床房"],
          bottom: "10px",
        },
        toolbox: {
          show: true,
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            // prettier-ignore
            data: this.dateList,
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "商务双床房",
            type: "bar",
            data: this.echartsDate.map((v) => v.businessPrice.toFixed(2)),
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
          {
            name: "大床房",
            type: "bar",
            data: this.echartsDate.map((v) => v.bigBedPrice.toFixed(2)),
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
          {
            name: "情侣主题房",
            type: "bar",
            data: this.echartsDate.map((v) => v.loversPrice.toFixed(2)),
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
        ],
      };
      myEcharts.setOption(option);
    },
    /** 获取首页基本数据 */
    async getHomeBaseInfo() {
      const res = await this.$axios.post("/api/home/getlist", {
        date: this.$moment().format("YYYY-MM-DD"),
      });
      if (res.code === "200" && res.data) {
        this.baseInfo = res.data;
      }
    },
    /** 获取首页基本数据 */
    async getHomeDetail() {
      const res = await this.$axios.get("/api/home/getHomeDetail");
      if (res.code === "200" && res.data) {
        const arr = [];
        res.data.forEach((item) => {
          item.date = this.$moment(item.date).format("MM-DD");
          arr.push(item.date);
        });
        const setArr = Array.from(new Set(arr));
        setArr.forEach((item) => {
          let obj = {
            businessPrice: 0,
            bigBedPrice: 0,
            loversPrice: 0,
            date: item,
          };
          res.data.forEach((v) => {
            if (v.date === item && v.roomTypeName === '商务大床房') {
              obj.businessPrice = obj.businessPrice + v.price;
            }
            if (v.date === item && v.roomTypeName === '大床房') {
              obj.bigBedPrice = obj.bigBedPrice + v.price;
            }
            if (v.date === item && v.roomTypeName === '情侣主题房') {
              obj.loversPrice = obj.loversPrice + v.price;
            }
          });
          this.echartsDate.push(obj);
        });
        this.dateList.forEach((item) => {
          const index = this.echartsDate.findIndex((v) => item === v.date);
          if (index === -1) {
            this.echartsDate.push({
              businessPrice: 0,
              bigBedPrice: 0,
              loversPrice: 0,
              date: item,
            });
          }
        });
      }
      this.echartsDate = this.sortData(this.echartsDate);
    },
    sortData(dateArr) {
      return dateArr.sort((a, b) => {
        return (
          Date.parse(a.date.replace(/-/g, "/")) -
          Date.parse(b.date.replace(/-/g, "/"))
        );
      });
    },
    /** 初始化日期 */
    initDate() {
      for (let index = 0; index < 12; index++) {
        this.dateList.push(
          this.$moment().subtract(index, "days").format("MM-DD")
        );
      }
      this.dateList.reverse();
    },
    async getRoomList() {
      const res = await this.$axios.post("/api/room/getRoomList", {});
      if (res) {
        this.stock = res.data.filter((v) => v.isEmpty === 0).length;
      }
    },
    /**
     *  获取当前用户是否是会员
     */
    async getMemberInfo() {
      const res = await this.$axios.post("/api/order/getMemberInfo", {});
      if (res.code === "200" && res.data) {
        this.haveMember = res.data.length;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.main {
}
.base-info-warp {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .base-info-item {
    height: 108px;
    min-width: 200px;
    flex: 1;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    margin-left: 10px;
    box-sizing: border-box;
  }
}
.person {
  font-size: 50px;
  color: #40c9c6;
}
.info {
  text-align: center;
  .info-text {
    line-height: 18px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .number {
    font-size: 18px;
  }
}
#echarts {
  width: 100%;
  height: 600px;
  background-color: #fff;
  margin-top: 10px;
}
</style>
