<template>
  <div class="canvas-container flex-1 w-full h-full relative">
    <canvas
      id="canvas"
      :style="{ width: cssWidth + 'px', height: cssHeight + 'px' }"
      class="bg-gray-50"
    ></canvas>
    <div class="btn absolute top-8 right-8">
      <button class="mr-4" @click="startDraw('polygon')">开启绘制多边形</button>
      <button class="mr-4" @click="startDraw('rectangle')">开启绘制矩形</button>
      <button class="mr-4" @click="startDraw('circle')">开启绘制圆形</button>
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
      canvas: null,
      ctx: null,
      cssWidth: 500,
      cssHeight: 500,
      point: [], // 区域的节点
      arrList: [], // 此数组用来计算区域的重心点
      isDraw: false, // 是否开启了绘制
      drawType: "polygon", // 开启了绘制，绘制的类型 polygon rectangle circle
      canvasDraw: {
        isDrawCanvas: false,
        point: [],
        origin: { x: 0, y: 0 }, // canvas的原点，默认为(0, 0)
        offset: { x: 0, y: 0 },
        originScale: 1, // canvas画布的缩放比，默认为1
        preScale: 1,
      },
    };
  },
  mounted() {
    this.canvas = this.firstResize();
    this.canvas.addEventListener("mousedown", this.addPoint);
    this.canvas.addEventListener("mouseup", this.upPoint);
    this.canvas.addEventListener("mousemove", this.mousePoint);
    this.canvas.addEventListener("contextmenu", this.endPoint);
    this.canvas.addEventListener("mousewheel", this.wheelCanvas);
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext("2d");
    }
    window.addEventListener("resize", () => {
      this.commomResize();
    });
  },
  methods: {
    firstResize() {
      const canvas = document.getElementById("canvas");
      const container = document.getElementsByClassName("canvas-container")[0];
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      this.cssWidth = container.offsetWidth;
      this.cssHeight = container.offsetHeight;
      return canvas;
    },
    // canvas大小响应式
    commomResize() {
      this.firstResize();
      this.$nextTick(() => {
        this.drawReset();
      });
    },
    windowToCanvas(x, y) {
      const box = this.canvas.getBoundingClientRect();
      return {
        x: x - box.left,
        y: y - box.top,
      };
    },
    windowToTransformCanvas(x, y) {
      const box = this.canvas.getBoundingClientRect();
      return {
        x:
          (x - box.left - this.canvasDraw.origin.x) /
          this.canvasDraw.originScale,
        y:
          (y - box.top - this.canvasDraw.origin.y) /
          this.canvasDraw.originScale,
      };
    },
    // 开启绘制
    startDraw(type) {
      this.point = [];
      this.isDraw = true;
      this.drawType = type;
    },
    // 关闭绘制
    del() {
      this.point = [];
      this.isDraw = false;
    },
    // 清除绘制内容
    delAll() {
      this.clearCanvas();
      this.arrList = [];
      this.point = [];
      this.isDraw = false;
    },
    // 清除canvas的全部内容
    delCanvas() {
      if (this.canvasDraw.origin >= 1) {
        this.ctx.clearRect(
          -Math.abs(this.canvasDraw.origin.x),
          -Math.abs(this.canvasDraw.origin.y),
          this.canvas.width,
          this.canvas.height
        );
      } else {
        this.ctx.clearRect(
          -Math.abs(this.canvasDraw.origin.x) / this.canvasDraw.originScale,
          -Math.abs(this.canvasDraw.origin.y) / this.canvasDraw.originScale,
          this.canvas.width / this.canvasDraw.originScale,
          this.canvas.height / this.canvasDraw.originScale
        );
      }
    },
    // canvas的mousedown事件
    addPoint(e) {
      if (this.isDraw) {
        const res = this.windowToTransformCanvas(e.clientX, e.clientY);
        this.point.push({
          x: res.x,
          y: res.y,
        });
      } else {
        const res = this.windowToCanvas(e.clientX, e.clientY);
        this.canvasDraw.isDrawCanvas = true;
        this.canvasDraw.point = res;
      }
    },
    // canvas的mousemove事件
    mousePoint(e) {
      if (this.isDraw && this.point.length) {
        const res = this.windowToTransformCanvas(e.clientX, e.clientY);
        if (["rectangle"].includes(this.drawType)) {
          const w = Math.abs(this.point[0].x - res.x);
          const h = Math.abs(this.point[0].y - res.y);
          const left = this.point[0].x > res.x ? res.x : this.point[0].x;
          const top = this.point[0].y > res.y ? res.y : this.point[0].y;
          this.point[0].w = w;
          this.point[0].h = h;
          this.point[0].left = left;
          this.point[0].top = top;
          this.point[0].center = {
            x: (this.point[0].x + res.x) / 2,
            y: (this.point[0].y + res.y) / 2,
          };
          this.drawRectangle(left, top, w, h);
        } else if (["circle"].includes(this.drawType)) {
          const w = Math.abs(this.point[0].x - res.x);
          const h = Math.abs(this.point[0].y - res.y);
          const r = Math.sqrt(w * w + h * h);
          this.point[0].r = r;
          this.drawCircle(this.point[0], r);
        } else {
          this.drawPolygon(
            this.point.concat({
              x: res.x,
              y: res.y,
            })
          );
        }
      } else if (this.canvasDraw.isDrawCanvas) {
        this.translateCnvas(e);
      }
    },
    // canvas的mouseup事件
    upPoint(e) {
      if (this.isDraw && ["rectangle", "circle"].includes(this.drawType)) {
        const res = this.windowToTransformCanvas(e.clientX, e.clientY);
        if (
          this.point.length === 1 &&
          (this.point.x !== res.x || this.point.y !== res.y)
        ) {
          if (["circle"].includes(this.drawType)) {
            this.arrList.push(
              JSON.parse(
                JSON.stringify({
                  data: this.point,
                  type: this.drawType,
                  r: this.point[0].r,
                })
              )
            );
          } else {
            this.arrList.push(
              JSON.parse(
                JSON.stringify({
                  data: this.point.push(res),
                  type: this.drawType,
                  w: this.point[0].w,
                  h: this.point[0].h,
                  left: this.point[0].left,
                  top: this.point[0].top,
                  center: this.point[0].center,
                })
              )
            );
          }
        }
        this.point = [];
        this.drawOtherArea();
      } else if (this.canvasDraw.isDrawCanvas) {
        this.canvasDraw.isDrawCanvas = false;
        this.canvasDraw.point = [];
        this.canvasDraw.origin.x = this.canvasDraw.offset.x;
        this.canvasDraw.origin.y = this.canvasDraw.offset.y;
      }
    },
    // canvas的contextmenu事件
    endPoint(e) {
      e.preventDefault(); // 阻止冒泡到浏览器事件
      this.point.pop(); // 右键时会触发mousedown事件，所以要去除最后一个添加的点
      this.arrList.push(
        JSON.parse(
          JSON.stringify({
            type: this.drawType,
            data: this.point,
          })
        )
      );
      this.point = [];
      this.drawOtherArea();
    },
    // canvas的mousewheel事件
    wheelCanvas(e) {
      e.preventDefault();
      const res = this.windowToCanvas(e.clientX, e.clientY);
      this.canvasDraw.preScale = this.canvasDraw.originScale;
      if (e.wheelDelta > 0) {
        // 放大
        this.canvasDraw.originScale = this.canvasDraw.originScale * 1.25;
      } else {
        // 缩小
        this.canvasDraw.originScale = this.canvasDraw.originScale * 0.8;
      }
      this.canvasDraw.offset.x =
        res.x -
        ((res.x - this.canvasDraw.offset.x) * this.canvasDraw.originScale) /
          this.canvasDraw.preScale;
      this.canvasDraw.offset.y =
        res.y -
        ((res.y - this.canvasDraw.offset.y) * this.canvasDraw.originScale) /
          this.canvasDraw.preScale;
      this.drawReset();
      this.canvasDraw.origin.x = this.canvasDraw.offset.x;
      this.canvasDraw.origin.y = this.canvasDraw.offset.y;
    },
    // 绘制区域
    drawPolygon(list) {
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
    // 绘制矩形
    drawRectangle(left, top, w, h) {
      this.drawOtherArea();
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "rgba(161, 195, 255, 0.5)";
      this.ctx.fillRect(left, top, w, h);
      this.ctx.strokeRect(left, top, w, h);
    },
    // 绘制圆形
    drawCircle(point, r) {
      this.drawOtherArea();
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "rgba(161, 195, 255, 0.5)";
      this.ctx.arc(point.x, point.y, r, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.stroke();
    },
    // 绘制之前绘制好的区域
    drawOtherArea() {
      this.delCanvas();
      this.arrList.forEach((item, index) => {
        this.ctx.beginPath();
        this.ctx.fillStyle = "red";
        this.ctx.font = '18px "微软雅黑"';
        let res = {};
        if (["polygon"].includes(item.type)) {
          res = this.getPolygonAreaCenter(item.data);
        } else if (["circle"].includes(item.type)) {
          res = item.data[0];
        } else {
          res = item.center;
        }
        this.ctx.fillText(`区域${index + 1}`, res.x, res.y);
        this.ctx.strokeStyle = "red";
        this.ctx.fillStyle = "rgba(161, 195, 255, 0.5)";
        if (["circle"].includes(item.type)) {
          this.ctx.arc(item.data[0].x, item.data[0].y, item.r, 0, 2 * Math.PI);
          this.ctx.fill();
          this.ctx.stroke();
        } else if (["rectangle"].includes(item.type)) {
          this.ctx.fillRect(item.left, item.top, item.w, item.h);
          this.ctx.strokeRect(item.left, item.top, item.w, item.h);
        } else {
          this.ctx.moveTo(item.data[0].x, item.data[0].y);
          item.data.forEach((v) => {
            this.ctx.lineTo(v.x, v.y);
          });
          this.ctx.fill();
          this.ctx.closePath();
          this.ctx.stroke();
        }
      });
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
    // 移动canvas画布
    translateCnvas(e) {
      const res = this.windowToCanvas(e.clientX, e.clientY);
      this.canvasDraw.offset.x =
        this.canvasDraw.origin.x + res.x - this.canvasDraw.point.x;
      this.canvasDraw.offset.y =
        this.canvasDraw.origin.y + res.y - this.canvasDraw.point.y;
      this.drawReset();
    },
    // 重绘
    drawReset() {
      this.clearCanvas();
      this.ctx.translate(this.canvasDraw.offset.x, this.canvasDraw.offset.y);
      this.ctx.scale(this.canvasDraw.originScale, this.canvasDraw.originScale);
      this.drawOtherArea();
    },
    // 重设canvas尺寸会清空并重置canvas内置的scale等
    clearCanvas() {
      this.canvas.width = this.cssWidth;
    },
  },
};
</script>

<style scoped></style>
