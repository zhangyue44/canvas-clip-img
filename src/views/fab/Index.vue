<template>
  <div class="h-full w-full overflow-auto">
    <canvas id="editorcanvas"></canvas>
    <div class="tool-btn flex gap-x-4 justify-center mt-4">
      <button class="tool-btn-item">选择</button>
      <button class="tool-btn-item">自由绘画</button>
      <button class="tool-btn-item">文本</button>
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import srcUrl from "@/views/imgClip/sss.jpg";

export default {
  data() {
    return {
      useSrcUrl: srcUrl,
      activeTool: null, // null | draw | text
      dragging: {
        open: false,
        lastPosX: null,
        lastPosY: null,
      },
      colorList: [
        { id: 1, value: "rgb(255, 0, 0)" },
        { id: 2, value: "rgb(255, 131, 43)" },
        { id: 3, value: "rgb(255, 204, 0)" },
        { id: 4, value: "rgb(29, 184, 76)" },
        { id: 5, value: "rgb(145, 35, 166)" },
        { id: 6, value: "rgb(255, 255, 255)" },
        { id: 7, value: "rgb(9, 10, 10)" },
      ],
      colorValue: null,
    };
  },
  created() {
    this.canvas = null;
    this.colorValue = this.colorList[0].value;
  },
  beforeDestroy() {
    if (this.canvas) {
      const node = this.canvas.getElement(); // 获取canvas元素
      this.canvas.dispose(); // 清空所有绘制实例与事件侦听,销毁fabric生成的实例
      node.remove();
      this.canvas = null;
    }
    const node = document.querySelector(".editorBox");
    if (node) node.remove();
  },
  mounted() {
    /**
     * 塞到body上，结合fixed使用
     * const node = document.querySelector('.editorBox'); if (node) document.body.append(node);
     */
    this.canvas = new fabric.Canvas("editorcanvas", {
      // backgroundVpt: false, // 锁定背景图，不受画板缩放移动的影响
      selectionFullyContained: true, // 只选择完全包含在拖动选择矩形中的元素
      // selection: false, // 不允许从画板框选，但允许选中元素
      // isDrawingMode: true, // 开启自由绘制
    });
    this.canvas.freeDrawingBrush.width = 10; // 画笔的宽度
    this.canvas.freeDrawingBrush.color = "red";
    // this.canvas.freeDrawingBrush.limitedToCanvasSize = true; // 自由绘制被限制为画布大小
    this.canvas.on("mouse:down", (opt) => {
      let evt = opt.e;
      if (evt.altKey) {
        // alt+鼠标点击：开启画板移动
        this.dragging.open = true;
        this.dragging.lastPosX = evt.clientX;
        this.dragging.lastPosY = evt.clientY;
      }
    });
    this.canvas.on("mouse:move", (opt) => {
      if (this.dragging.open) {
        let evt = opt.e;
        let vpt = this.canvas.viewportTransform;
        vpt[4] += evt.clientX - this.dragging.lastPosX;
        vpt[5] += evt.clientY - this.dragging.lastPosY;
        this.canvas.requestRenderAll(); // 异步更新画板，提升性能
        this.dragging.lastPosX = evt.clientX;
        this.dragging.lastPosY = evt.clientY;
      }
    });
    this.canvas.on("mouse:up", (opt) => {
      if (this.dragging.open) {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.dragging.open = false;
      }
    });
    this.canvas.on("mouse:wheel", (opt) => {
      let delta = opt.e.deltaY; // 正值为放大
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      // this.canvas.setZoom(zoom) // 以画板原点来缩放画板
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom); // 以鼠标指针来缩放画板
    });
    this.init();
    setTimeout(() => {
      const text = new fabric.IText("请输入文本", {
        fill: "red",
        left: 10,
        top: 10,
      });
      this.canvas.add(text);
    }, 6000);
  },
  methods: {
    init() {
      const img = document.createElement("img");
      img.src = this.useSrcUrl;
      img.onload = () => {
        let width;
        let height;
        const radio = img.width / img.height;
        if (radio > 1) {
          width = Math.min(img.width, 1200);
          height = width / radio;
        } else {
          height = Math.min(img.height, 700);
          width = height * radio;
        }
        this.initCanvas(width, height, img.width, img.height);
      };
    },
    initCanvas(width, height, imgWidth, imgHeight) {
      this.canvas.setDimensions({ width, height }); // 设置canvas的宽高
      this.$nextTick(() => {
        this.canvas.setBackgroundImage(
          this.useSrcUrl,
          this.canvas.renderAll.bind(this.canvas),
          {
            imgWidth,
            imgHeight,
            scaleX: width / imgWidth,
            scaleY: height / imgHeight,
            originX: "left",
            originY: "top",
          }
        );
      });
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .canvas-container {
  margin: 0 auto;
}
.tool-btn {
  &-item {
    padding: 4px;
    cursor: pointer;
    &.active {
      background-color: pink;
    }
    &:hover {
      background-color: #ccc;
    }
  }
}
</style>
