<template>
  <div class="w-full h-full">
    <div class="relative inline-block" style="width: 300px; height: 150px">
      <div
        class="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center text-black text-4xl -z-10 select-none"
      >
        谢谢惠顾
      </div>
      <canvas id="guacanvas"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      flag: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const _that = this;
      this.myCanvas = document.getElementById("guacanvas");
      this.ctx = this.myCanvas.getContext("2d");
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = "#ccc";
      this.ctx.fillRect(0, 0, 300, 150);
      this.ctx.fillStyle = "#000";
      this.ctx.font = "18px 微软雅黑";
      this.ctx.textAlign = "center";
      this.ctx.fillText("刮一刮", 140, 70, 120);
      this.myCanvas.addEventListener("mousedown", function () {
        _that.flag = true;
        _that.myCanvas.addEventListener("mousemove", _that.mousemoveCLick);
      });
      this.myCanvas.addEventListener("mouseup", function (e) {
        _that.flag = false;
        _that.myCanvas.removeEventListener("mousemove", _that.mousemoveCLick);
        _that.calcArc(e);
      });
    },
    mousemoveCLick(e) {
      if (this.flag) this.drawArc(e);
    },
    drawArc(e) {
      const canvasPos = this.myCanvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasPos.left;
      const mouseY = e.clientY - canvasPos.top;
      // 仅保留现有画布内容和新形状不重叠的部分
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.moveTo(mouseX, mouseY);
      this.ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI);
      this.ctx.fill();
    },
    calcArc(e) {
      // canvas区域隐含的像素数据
      let myImg = this.ctx.getImageData(
        0,
        0,
        this.myCanvas.width,
        this.myCanvas.height
      );
      let num = 0;
      let max = myImg.data.length / 4; // 减小性能，取1/4面积进行计算
      for (let i = 0; i < myImg.data.length; i += 4) {
        if (myImg.data[i + 3] == 0) {
          num++;
        }
      }
      if (num >= max * 0.5) {
        this.myCanvas.remove();
      }
    },
  },
};
</script>

<style scoped lang="scss"></style>
