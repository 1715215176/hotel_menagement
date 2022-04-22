import Vue from "vue";
import VueRouter from "vue-router";
import routes from './routes';

const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch((error) => error);
};

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  let isAuthenticated = JSON.parse(
    localStorage.getItem("hotelUserInfo")
  );
  if (to.name !== "Login" && !isAuthenticated) next({ name: "Login" });
  else next();
});
export default router;
