<template>
  <div id="app">
    <div>
      <router-link to="/she">贪吃蛇</router-link>
      <router-link to="/imgclip">图片裁剪</router-link>
      <router-link to="/handwritten">手写签名</router-link>
      <router-link to="/drawArea">绘制区域</router-link>
      <router-link to="/fab">fabric</router-link>
    </div>
    <router-view />
  </div>
</template>

<style>
html,
body {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
a {
  margin: 0 4px;
  color: blue !important;
  text-decoration: underline !important;
}
</style>
