import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/handwritten",
  },
  {
    path: "/she",
    name: "about",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "../views/tanchishe/AboutView.vue"
      ),
  },
  {
    path: "/imgclip",
    name: "imgclip",
    component: () =>
      import(
        /* webpackChunkName: "imgclip" */ "../views/imgClip/AboutView.vue"
      ),
  },
  {
    path: "/handwritten",
    name: "handwritten",
    component: () =>
      import(
        /* webpackChunkName: "handwritten" */ "../views/handwritten/AboutView.vue"
      ),
  },
  {
    path: "/drawArea",
    name: "drawArea",
    component: () =>
      import(
        /* webpackChunkName: "handwritten" */ "../views/drawArea/drawArea.vue"
      ),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
