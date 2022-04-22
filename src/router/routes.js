const routes = [
  {
    path: "/",
    name: "dataCenter",
    meta: {
      title: "数据中心",
      icon: "el-icon-menu",
      showInMenu: true,
    },
    component: () =>
      import(/* webpackChunkName: "Layout" */ "@/views/Layout.vue"),
    redirect: "/home",
    children: [
      {
        path: "/home",
        meta: {
          title: "首页",
          icon: "",
          showInMenu: true,
        },
        name: "Home",
        component: () =>
          import(/* webpackChunkName: "Home" */ "@/views/Home.vue"),
      },
    ],
  },
  {
    path: "/hotelMessage",
    name: "HotelMessage",
    meta: {
      title: "酒店信息管理",
      icon: "el-icon-s-unfold",
      showInMenu: true,
    },
    redirect: "/hotelMessage/roomTypeList",
    component: () =>
      import(/* webpackChunkName: "Main" */ "@/views/Layout.vue"),
    children: [
      {
        path: "/hotelMessage/roomTypeList",
        name: "RoomTypeList",
        meta: {
          title: "酒店房型列表",
          icon: "",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "Main" */ "@/views/hotelMenegement/RoomTypeList.vue"
          ),
      },
      {
        path: "/hotelMessage/roomList",
        name: "RoomList",
        meta: {
          title: "房型列表",
          icon: "",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "hotelMenegement" */ "@/views/hotelMenegement/RoomList"
          ),
      },
      {
        path: "/roomPanel",
        name: "RoomPanel",
        meta: {
          title: "开房面板",
          icon: "",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "RoomPanel" */ "@/views/hotelMenegement/RoomPanel"
          ),
      },
    ],
  },
  {
    path: "/orderMenegement",
    name: "orderMenegement",
    meta: {
      title: "订单管理",
      icon: "el-icon-notebook-1",
      showInMenu: true,
    },
    redirect: "/orderMenegement/roomOrder",
    component: () =>
      import(/* webpackChunkName: "Layout" */ "@/views/Layout.vue"),
    children: [
      {
        path: "/orderMenegement/roomOrder",
        name: "RoomOrder",
        meta: {
          title: "全部订单",
          icon: "",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "orderMenegement" */ "@/views/orderMenegement/orderList"
          ),
      },
    ],
  },
  {
    path: "/propotionMenegement",
    name: "propotionMenegement",
    meta: {
      title: "营销管理",
      icon: "el-icon-postcard",
      showInMenu: true,
    },
    redirect: "/propotionMenegement/searchMember",
    component: () =>
      import(/* webpackChunkName: "Layout" */ "@/views/Layout.vue"),
    children: [
      {
        path: "/propotionMenegement/searchMember",
        name: "SearchMember",
        meta: {
          title: "会员查询",
          icon: "",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "hotelMenegement" */ "@/views/marketMenegement/SearchMember"
          ),
      },
      {
        path: "/propotionMenegement/MemberCardList",
        name: "MemberCardList",
        meta: {
          title: "会员卡列表",
          icon: "el-icon-postcard",
          showInMenu: true,
        },
        component: () =>
          import(
            /* webpackChunkName: "hotelMenegement" */ "@/views/marketMenegement/MemberCardList"
          ),
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "登录",
      showInMenu: false,
    },
    component: () =>
      import(/* webpackChunkName: "Layout" */ "@/views/Login.vue"),
  },
];
export default routes;