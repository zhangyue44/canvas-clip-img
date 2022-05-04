<template>
  <div class="container">
    <div class="top">
      <span id="score">Score: 0</span>
      <button id="restart">重新开始</button>
      <button id="stop">暂停</button>
      <button id="continue">继续</button>
    </div>
    <div class="main">
      <canvas id="snake" width="640" height="400"></canvas>
      <div id="start">开始</div>
    </div>
  </div>
</template>

<script>
import { she } from "./she.js";

export default {
  name: "Home",
  data() {
    return {
      scoreDom: null, // 计数
      startDom: null, // 开始
      restart: null, // 重新开发
      stop: null, // 暂停
      continue: null, // 继续
      greedySnake: null, // 实例化
    };
  },
  mounted() {
    she(this);
    // 开始
    this.startDom.onclick = () => {
      if (!this.greedySnake.isStart) {
        this.greedySnake.start();
      } else {
        this.greedySnake.continue();
      }
    };
    // 重新开始
    this.restart.onclick = () => {
      if (!this.greedySnake.isStart) return;
      this.greedySnake.start();
    };
    // 暂停
    this.stop.onclick = () => {
      if (this.greedySnake.isStop || !this.greedySnake.isStart) return;
      this.greedySnake.stop();
    };
    // 继续
    this.continue.onclick = () => {
      if (!this.greedySnake.isStop || !this.greedySnake.isStart) return;
      this.greedySnake.continue();
    };
  },
};
</script>

<style scoped>
body {
  background-color: #eee;
}
.container {
  text-align: center;
}
.top {
  margin: 20px auto;
  width: 640px;
}
#score {
  float: left;
}
.main {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 642px;
  height: 402px;
}
#snake {
  border: 1px solid #000;
  width: 640px;
  height: 400px;
  display: inline-block;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.1);
}
#start {
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: block;
  color: #fff;
  line-height: 400px;
  text-align: center;
  font-size: 30px;
  cursor: pointer;
}
</style>
