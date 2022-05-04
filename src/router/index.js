import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "about",
    component: () =>
      // import(/* webpackChunkName: "about" */ "../views/imgClip/AboutView.vue"),
      import(
        /* webpackChunkName: "about" */ "../views/tanchishe/AboutView.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
