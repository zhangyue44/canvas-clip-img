<template>
  <div class="about">
    <button @click="caijian">图片裁剪</button>
    <canvas id="mycanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script>
/**
 * 1. 注意点：
 * 2. 引入本地图片路径时，一定要使用require()的方式，image.onload()才会生效。使用image.src='./sss.jpg'的方式不生效
 * 3. canvas有默认宽高值，width默认值为300 height默认值为150
 * 4. 给canvas画布大小时，不可以使用css样式改变画布大小，因为这样只会拉伸或缩小画布大小，canvas中的坐标都没有改变
 * 5. 改变canvas画布大小，使用直接赋值width与height的方式
 */
export default {
  name: "About",
  data() {
    return {
      canvas: null,
      ctx: null,
      canvasWidth: window.innerWidth * 0.8,
      canvasHeight: window.innerHeight * 0.8,
      image: null,
      imageX: 0,
      imageY: 0,
      imageScale: 1,
      move: false,
      downpos: null,
      movePos: null,
    };
  },
  mounted() {
    window.onresize = () => {
      this.canvasWidth = window.innerWidth * 0.8;
      this.canvasHeight = window.innerHeight * 0.8;
      this.$nextTick(() => {
        this.drawImage();
      });
    };
    this.canvas = document.querySelector("#mycanvas");
    this.ctx = this.canvas.getContext("2d");
    this.image = new Image();
    this.image.src = require("./sss.jpg");
    this.image.onload = () => {
      this.drawImage();
    };
    this.canvas.onmousedown = (e) => {
      this.downpos = this.windowToCanvas(e.clientX, e.clientY);
      if (this.downpos.x > this.imageX && this.downpos.y > this.imageY) {
        this.move = true;
        this.canvas.style.cursor = "pointer";
      }
    };
    this.canvas.onmousemove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      if (
        mouseX > this.canvas.getBoundingClientRect().left ||
        mouseY > this.canvas.getBoundingClientRect().top
      ) {
        if (this.move) {
          this.movePos = this.windowToCanvas(mouseX, mouseY);
          const x = this.movePos.x - this.downpos.x;
          const y = this.movePos.y - this.downpos.y;
          this.imageX += x;
          this.imageY += y;
          this.drawImage();
          this.downpos = JSON.parse(JSON.stringify(this.movePos));
        }
      }
    };
    document.onmouseup = (e) => {
      this.canvas.style.cursor = "default";
      this.downPos = null;
      this.movePos = null;
      this.move = false;
    };
    this.canvas.onmousewheel = (e) => {
      const pos = this.windowToCanvas(e.clientX, e.clientY);
      const wheelDelta = e.wheelDelta ? e.wheelDelta : e.deltalY * -40;
      if (wheelDelta > 0) {
        /**
         * imageX - 0.25(pos.x - imageX)
         */
        this.imageScale = this.imageScale * 1.25;
        this.imageX = this.imageX * 1.25 - pos.x * 0.25;
        this.imageY = this.imageY * 1.25 - pos.y * 0.25;
      } else {
        this.imageScale = this.imageScale * 0.8;
        this.imageX = this.imageX * 0.8 + pos.x * 0.2;
        this.imageY = this.imageY * 0.8 + pos.y * 0.2;
      }
      this.drawImage();
    };
  },
  methods: {
    windowToCanvas(x, y) {
      const box = this.canvas.getBoundingClientRect();
      return {
        x: x - box.left,
        y: y - box.top,
      };
    },
    drawImage() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        this.imageX,
        this.imageY,
        this.image.width * this.imageScale,
        this.image.height * this.imageScale
      );
    },
    caijian() {
      let imgUrl = this.canvas.toDataURL("image/jpeg", 1.0);
      let a = document.createElement("a");
      a.download = "caijian.jpeg";
      a.href = imgUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  },
};
</script>

<style scoped>
.about {
  width: 100%;
  height: 80%;
  display: flex;
}
canvas {
  margin: auto;
  background-color: black;
}
</style>
