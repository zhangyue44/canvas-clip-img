<template>
  <div class="canvas-container flex-1 w-full h-full relative">
    <canvas id="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <div class="btn absolute top-8 right-8">
      <button class="mr-4" @click="startDraw">开启绘制能力</button>
      <button class="mr-4" @click="del">关闭绘制能力</button>
      <button @click="delAll">清除绘制内容</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "drawArea",
  data() {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      canvas: null,
      ctx: null,
      point: [], // 区域的节点
      arrList: [], // 此数组用来计算区域的重心点
      isDraw: false, // 是否开启了绘制
    };
  },
  mounted() {
    this.canvas = this.commomResize();
    this.canvas.addEventListener("mousedown", this.addPoint);
    this.canvas.addEventListener("mousemove", this.mousePoint);
    this.canvas.addEventListener("contextmenu", this.endPoint);
    if (canvas.getContext) {
      this.ctx = canvas.getContext("2d");
    }
    window.addEventListener("resize", () => {
      this.commomResize();
    });
  },
  methods: {
    // canvas大小响应式
    commomResize() {
      const canvas = document.getElementById("canvas");
      const container = document.getElementsByClassName("canvas-container")[0];
      // canvas.setAttribute("width", container.offsetWidth);
      // canvas.setAttribute("height", container.offsetHeight);
      this.canvasWidth = container.offsetWidth;
      this.canvasHeight = container.offsetHeight;
      return canvas;
    },
    windowToCanvas(x, y) {
      const box = this.canvas.getBoundingClientRect();
      return {
        x: x - box.left,
        y: y - box.top,
      };
    },
    // 开始绘制
    startDraw() {
      this.point = [];
      this.isDraw = true;
    },
    // 清除
    del() {
      this.point = [];
      this.isDraw = false;
    },
    // 清除绘制内容
    delAll() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.arrList = [];
      this.point = [];
      this.isDraw = false;
    },
    // canvas的mousedown事件
    addPoint(e) {
      if (this.isDraw) {
        const res = this.windowToCanvas(e.clientX, e.clientY);
        this.point.push({
          x: res.x,
          y: res.y,
        });
      }
    },
    // canvas的mousemove事件
    mousePoint(e) {
      if (this.isDraw) {
        const res = this.windowToCanvas(e.clientX, e.clientY);
        this.drawPolygon(
          this.point.concat({
            x: res.x,
            y: res.y,
          })
        );
      }
    },
    // 绘制区域
    drawPolygon(list) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawOtherArea();
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "rgba(161, 195, 255, 0.5)";
      this.ctx.moveTo(list[0].x, list[0].y);
      list.forEach((v) => {
        this.ctx.lineTo(v.x, v.y);
      });
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.stroke();
    },
    // 绘制之前绘制好的区域
    drawOtherArea() {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.arrList.forEach((item, index) => {
        this.ctx.beginPath();
        this.ctx.fillStyle = "red";
        this.ctx.font = '18px "微软雅黑"';
        const res = this.getPolygonAreaCenter(item);
        this.ctx.fillText(`区域${index + 1}`, res.x, res.y);
        this.ctx.strokeStyle = "red";
        this.ctx.fillStyle = "rgba(161, 195, 255, 0.5)";
        this.ctx.moveTo(item[0].x, item[0].y);
        item.forEach((v) => {
          this.ctx.lineTo(v.x, v.y);
        });
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.stroke();
      });
    },
    // canvas的contextmenu事件
    endPoint(e) {
      e.preventDefault(); // 阻止冒泡到浏览器事件
      this.point.pop(); // 右键时会触发mousedown事件，所以要去除最后一个添加的点
      this.arrList.push(JSON.parse(JSON.stringify(this.point)));
      this.isDraw = false;
      this.drawOtherArea();
    },
    // 区域的重心点(几何中心点)
    getPolygonAreaCenter(points) {
      let sum_x = 0;
      let sum_y = 0;
      let sum_area = 0;
      let p1 = points[1];
      for (let i = 2; i < points.length; i++) {
        const p2 = points[i];
        const area = this.Area(points[0], p1, p2);
        sum_area += area;
        sum_x += (points[0].x + p1.x + p2.x) * area;
        sum_y += (points[0].y + p1.y + p2.y) * area;
        p1 = p2;
      }
      return {
        x: sum_x / sum_area / 3,
        y: sum_y / sum_area / 3,
      };
    },
    // 计算面积，这里是拆成一个个三角形进行的计算
    Area(p0, p1, p2) {
      let area =
        (p0.x * p1.y +
          p1.x * p2.y +
          p2.x * p0.y -
          p0.x * p2.y -
          p1.x * p0.y -
          p2.x * p1.y) /
        2;
      return area;
    },
  },
};
</script>

<style scoped></style>
