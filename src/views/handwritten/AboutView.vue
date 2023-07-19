<template>
  <div class="container">
    <div style="margin: 30px">
      <input
        type="radio"
        name="tool"
        checked
        @change="toolChange('huabi')"
      /><label>画笔</label>
      <input type="radio" name="tool" @change="toolChange('shuazi')" />
      <label>刷子</label>
      <input type="radio" name="tool" @change="toolChange('penqiang')" />
      <label>喷枪</label>
      <input type="radio" name="tool" @change="toolChange('xiangpi')" />
      <label>橡皮</label>
    </div>
    <div class="sub" v-if="flag">
      <select v-model="shape">
        <option>rect</option>
        <option>circle</option>
      </select>
      <label>大小(px)</label><input v-model="size" />
    </div>
    <canvas width="800" height="600"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ctx: null,
      tool: "huabi",
      x: null,
      y: null,
      x1: null,
      y1: null,
      flag: false,
      size: 10,
      shape: "rect",
    };
  },
  mounted() {
    const canvas = document.querySelector("canvas");
    this.ctx = canvas.getContext("2d");
    const that = this;
    canvas.onmousedown = function (e) {
      that.x = e.clientX - this.offsetLeft;
      that.y = e.clientY - this.offsetTop;
      document.onmousemove = function (ev) {
        that.x1 = ev.clientX - canvas.offsetLeft;
        that.y1 = ev.clientY - canvas.offsetTop;
        that.draw();
        that.x = that.x1;
        that.y = that.y1;
      };
    };
    document.onmouseup = function () {
      this.onmousemove = null;
    };
  },
  methods: {
    toolChange(type) {
      this.tool = type;
      this.flag = type === "xiangpi" ? true : false;
    },
    draw() {
      switch (this.tool) {
        case "huabi":
          this.huabi();
          break;
        case "shuazi":
          this.shuazi();
          break;
        case "penqiang":
          this.penqiang();
          break;
        case "xiangpi":
          this.xiangpi();
          break;
      }
    },
    // 测试一下
    huabi() {
      this.ctx.beginPath();
      this.ctx.globalAlpha = 1;
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000";
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x1, this.y1);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    shuazi() {
      this.ctx.beginPath();
      this.ctx.globalAlpha = 1;
      this.ctx.lineWidth = 10;
      this.ctx.strokeStyle = "#000";
      this.ctx.moveTo(this.x, this.y);
      this.ctx.lineTo(this.x1, this.y1);
      this.ctx.closePath();
      this.ctx.stroke();
    },
    penqiang() {
      for (let i = 0; i < 10; i++) {
        let randomNum = Math.random() * 15;
        this.ctx.fillStyle = "#000";
        this.ctx.beginPath();
        this.ctx.globalAlpha = 0.5;
        this.ctx.arc(this.x + randomNum, this.y + randomNum, 1, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    },
    xiangpi() {
      this.ctx.beginPath();
      this.ctx.globalAlpha = 1;
      switch (this.shape) {
        case "rect":
          this.ctx.lineWidth = this.size;
          this.ctx.strokeStyle = "#fff";
          this.ctx.moveTo(this.x, this.y);
          this.ctx.lineTo(this.x1, this.y1);
          this.ctx.closePath();
          this.ctx.stroke();
          break;
        case "circle":
          console.log("circle");
          this.ctx.fillStyle = "#fff";
          this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
          this.ctx.fill();
          break;
      }
    },
  },
};
</script>

<style scoped>
canvas {
  border: 1px solid #e6e6e6;
}
</style>
