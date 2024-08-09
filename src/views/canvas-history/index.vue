<template>
  <div class="imgDraw w-full h-full overflow-hidden">
    <div class="board" ref="board">
      <canvas id="ctx_front" ref="ctx_front"></canvas>
      <canvas id="ctx_base" ref="ctx_base"></canvas>
      <canvas id="ctx_back" ref="ctx_back"></canvas>
      <input
        name="text"
        id="text"
        @blur="handleTextBlur"
        @keyup.enter="handleTextBlur"
        v-model="text"
        autofocus
        autocomplete="off"
        :style="
          'font-size:' + (this.slide * 10 + 14) + 'px;color:' + defaultColor
        "
      />
    </div>
    <div :class="['tools', 'settings']">
      <div class="tool_item" v-for="(item, index) in settings" :key="item.icon">
        <button v-if="index == 0">
          <span>{{ item.name }}</span>
        </button>
        <div v-else-if="index == 1" class="slide">
          <span>{{ item.name }}</span>
        </div>
        <button v-else @click.stop="item.fun">
          <span>{{ item.name }}</span>
        </button>
      </div>
      <div class="tool_item" v-for="item in btns" :key="item.icon">
        <button
          @click.stop="item.fun"
          v-if="item.name == '上一步'"
          :disabled="prevDis"
        >
          <span>{{ item.name }}</span>
        </button>
        <button
          @click.stop="item.fun"
          v-else-if="item.name == '下一步'"
          :disabled="nextDis"
        >
          <span>{{ item.name }}</span>
        </button>
        <button @click.stop="item.fun" v-else>
          <span>{{ item.name }}</span>
        </button>
      </div>
    </div>
    <div :class="['tools', 'bars']">
      <div
        :class="['tool_item', activeTool == item.toolType ? 'activeTool' : '']"
        v-for="item in tools"
        :key="item.toolType"
        @click.stop="handleChangeToolType(item.toolType)"
      >
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import bg from "./sss.jpg";

export default {
  name: "imgDraw",
  data() {
    return {
      defaultColor: "red",
      slide: 1,
      settings: [
        {
          icon: "#icon-youqitong_huaban1",
          name: "颜色",
          fun: "",
        },
        {
          icon: "#icon-huabi_huaban1",
          name: "粗细",
          fun: "",
        },
        {
          icon: "#icon-fangda_huaban1",
          name: "放大",
          fun: () => this.handleBeLarge(),
        },
        {
          icon: "#icon-suoxiao_huaban1",
          name: "缩小",
          fun: () => this.handleBeSmall(),
        },
      ],
      activeTool: 1,
      tools: [
        {
          icon: "#icon-huabi_huaban1",
          name: "画笔",
          toolType: 1,
        },
        {
          icon: "#icon-zhixian_huaban1",
          name: "直线",
          toolType: 2,
        },
        {
          icon: "#icon-yuanquan_huaban1",
          name: "圆形",
          toolType: 3,
        },
        {
          icon: "#icon-juxinggongju_huaban1",
          name: "矩形",
          toolType: 4,
        },
        {
          icon: "#icon-xiangpi_huaban1",
          name: "橡皮",
          toolType: 5,
        },
        {
          icon: "#icon-wenzi_huaban1",
          name: "文字",
          toolType: 6,
        },
      ],
      btns: [
        {
          icon: "#icon-chexiao",
          name: "上一步",
          fun: () => this.handlePrev(),
        },
        {
          icon: "#icon-zhongzuo",
          name: "下一步",
          fun: () => this.handleNext(),
        },
        {
          icon: "#icon-lajixiang_huaban1",
          name: "清除",
          fun: () => this.handleClearCanvas(),
        },
        {
          icon: "#icon-baocun",
          name: "保存",
          fun: () => this.handleCanvas2Img(),
        },
      ],
      canvas_front: null,
      canvas_back: null,
      canvas_base: null,
      ctx_base: null,
      ctx_front: null,
      ctx_back: null,
      currentImg: {
        url: bg,
        width: "",
        height: "",
        scale: 1,
        index: 0,
      },
      canDraw: false,
      text: "",
      canvasStore: [bg],
      prevDis: true,
      nextDis: true,
      baseMap: bg,
      tl: 0,
      tt: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.handleInitCanvas();
      this.handleChangeToolType(1);
    });
  },
  methods: {
    /** 初始化画布 */
    handleInitCanvas() {
      const board = this.$refs.board;
      const { clientWidth, clientHeight } = board;
      this.currentImg = {
        url: bg,
        width: clientWidth,
        height: clientHeight,
        scale: 1,
        index: 0,
      };
      this.canvasStore = [bg];
      this.prevDis = true;
      this.nextDis = true;

      // 用于绘制的画板
      this.canvas_front = document.getElementById("ctx_front");
      // 用于生成绘制后图片的画板
      this.canvas_back = document.getElementById("ctx_back");
      // 底图画板，橡皮擦除时获取像素放到绘制画板中，达到不擦出底图的效果
      this.canvas_base = document.getElementById("ctx_base");
      this.ctx_base = this.canvas_base.getContext("2d");
      this.ctx_front = this.canvas_front.getContext("2d");
      this.ctx_back = this.canvas_back.getContext("2d");
      this.canvas_front.width = clientWidth;
      this.canvas_front.height = clientHeight;
      this.canvas_back.width = clientWidth;
      this.canvas_back.height = clientHeight;
      this.canvas_base.width = clientWidth;
      this.canvas_base.height = clientHeight;
      this.ctx_front.strokeStyle = this.defaultColor;

      const img = new Image();
      img.src = this.baseMap;
      const _this = this;
      img.onload = function () {
        const width = parseInt(this.width);
        const height = parseInt(this.height);
        _this.ctx_back.drawImage(this, 0, 0, width, height);
        _this.ctx_base.drawImage(this, 0, 0, width, height);
      };
    },
    /** 工具切换 */
    handleChangeToolType(type) {
      this.activeTool = type;
      this.handleDrawCanvas(type);
    },
    handleDrawCanvas(type) {
      this.canDraw = false;
      let sx;
      let sy;
      let mx;
      let my;
      const text = document.getElementById("text");
      // 鼠标按下
      const mousedown = (e) => {
        const position = this.canvas_front.getBoundingClientRect();
        this.ctx_front.strokeStyle = this.defaultColor;
        this.ctx_front.lineWidth = this.slide;
        sx = e.clientX - position.left;
        sy = e.clientY - position.top;
        const cbx = this.ctx_base.getImageData(
          e.offsetX - this.slide / 2,
          e.offsetY - this.slide / 2,
          this.slide * 2,
          this.slide * 2
        );
        this.ctx_front.moveTo(sx, sy);
        this.canDraw = true;
        switch (type) {
          case 1:
            this.ctx_front.beginPath();
            break;
          case 5:
            this.ctx_front.putImageData(
              cbx,
              e.offsetX - this.slide / 2,
              e.offsetY - this.slide / 2
            );
            break;
          case 6:
            this.handleTextBlur();
            this.text = "";
            text.style.fontSize = `${14 + this.slide * 10}px`;
            text.style.color = this.defaultColor;
            text.style.left = `${
              e.offsetX + this.canvas_front.offsetLeft - 20
            }px`;
            text.style.top = `${
              e.offsetY + this.canvas_front.offsetTop - 10
            }px`;
            text.style.zIndex = 10;
            text.style.display = "block";
            this.tl = e.offsetX - 20;
            this.tt = e.offsetY + 10;
            break;
        }
      };
      const mousemove = (e) => {
        mx = e.clientX - this.canvas_front.offsetLeft;
        my = e.clientY - this.canvas_front.offsetTop;
        const cbx = this.ctx_base.getImageData(
          e.offsetX - this.slide / 2,
          e.offsetY - this.slide / 2,
          this.slide * 2,
          this.slide * 2
        );
        if (this.canDraw) {
          switch (type) {
            case 1:
              this.ctx_front.lineTo(mx, my);
              this.ctx_front.stroke();
              break;
            case 2:
              this.handleFrommatCanvas();
              this.ctx_front.beginPath();
              this.ctx_front.moveTo(sx, sy);
              this.ctx_front.lineTo(mx, my);
              this.ctx_front.stroke();
              break;
            case 3:
              this.handleFrommatCanvas();
              this.ctx_front.beginPath();
              const rds = Math.sqrt(
                (sx - mx) * (sx - mx) + (sy - my) * (sy - my)
              );
              this.ctx_front.arc(sx, sy, rds, 0, Math.PI * 2, false);
              this.ctx_front.stroke();
              break;
            case 4:
              this.handleFrommatCanvas();
              this.ctx_front.beginPath();
              this.ctx_front.moveTo(sx, sy);
              this.ctx_front.lineTo(mx, sy);
              this.ctx_front.lineTo(mx, my);
              this.ctx_front.lineTo(sx, my);
              this.ctx_front.lineTo(sx, sy);
              this.ctx_front.stroke();
              break;
            case 5:
              this.ctx_front.putImageData(
                cbx,
                e.offsetX - this.slide / 2,
                e.offsetY - this.slide / 2
              );
              break;
          }
        }
      };
      const mouseup = () => {
        if (this.canDraw) {
          this.canDraw = false;
          this.ctx_front.closePath();
          if (type != 6) {
            this.handleSaveCanvasStore();
          }
        }
      };
      this.canvas_front.onmousedown = (e) => mousedown(e);
      this.canvas_front.onmousemove = (e) => mousemove(e);
      this.canvas_front.onmouseup = (e) => mouseup(e);
      this.canvas_front.onmouseout = (e) => mouseup(e);
      this.canvas_front.onmouseleave = (e) => mouseup(e);
    },
    /** 保存绘制 */
    handleSaveCanvasStore() {
      const url = this.canvas_front.toDataURL();
      const image = new Image();
      image.src = url;
      image.onload = () => {
        this.ctx_front.clearRect(
          0,
          0,
          this.canvas_front.width,
          this.canvas_front.height
        );
        this.ctx_front.drawImage(image, 0, 0, image.width, image.height);
        this.ctx_back.drawImage(image, 0, 0, image.width, image.height);
        const url2 = this.canvas_back.toDataURL();
        this.currentImg.url = url2;
        this.currentImg.index += 1;
        this.canvasStore.push(url2);
        this.prevDis = false;
        console.log(this.canvasStore);
      };
    },
    /** 下载图片 */
    handleCanvas2Img() {
      const canvas = document.getElementById("ctx_back");
      const a = document.createElement("a");
      a.href = canvas.toDataURL();
      a.download = "ddd.png";
      document.body.appendChild(a);
      a.click();
    },
    /** 清除画布 */
    handleClearCanvas() {
      this.handleInitCanvas();
    },
    handleFrommatCanvas() {
      this.ctx_front.clearRect(
        0,
        0,
        this.canvas_front.width,
        this.canvas_front.height
      );
    },
    /** 失焦或者回车绘制文本，框隐藏 */
    handleTextBlur() {
      const text = document.getElementById("text");
      this.ctx_front.font = `300 ${text.style.fontSize} sans-serif`;
      this.ctx_front.fillStyle = this.defaultColor;
      this.ctx_front.fillText(this.text, this.tl, this.tt);
      text.style.display = "none";
      this.text = "";
      text.value = "";
      this.handleSaveCanvasStore();
    },
    handleBeLarge() {
      this.currentImg.scale = 1;
      this.currentImg.scale += 0.1;
      this.$nextTick(() => {
        this.handleDrawImage();
      });
    },
    handleBeSmall() {
      this.currentImg.scale = 1;
      this.currentImg.scale -= 0.1;
      this.$nextTick(() => {
        this.handleDrawImage();
      });
    },
    /** 处理放大缩小 */
    handleDrawImage() {
      const _this = this;
      _this.currentImg.width = _this.currentImg.width * this.currentImg.scale;
      _this.currentImg.height = _this.currentImg.height * this.currentImg.scale;
      const img = new Image();
      img.src = this.currentImg.url;
      img.onload = function () {
        _this.ctx_front.drawImage(
          this,
          0,
          0,
          _this.currentImg.width,
          _this.currentImg.height
        );
        _this.ctx_back.drawImage(
          this,
          0,
          0,
          _this.currentImg.width,
          _this.currentImg.height
        );
      };
    },
    /** 上一步 */
    handlePrev() {
      if (this.currentImg.index > 0) {
        this.nextDis = false;
        this.currentImg.index -= 1;
        this.currentImg.index == 0
          ? (this.prevDis = true)
          : (this.prevDis = false);
        this.currentImg.url = this.canvasStore[this.currentImg.index];
        this.currentImg.scale = 1;
        this.handleDrawImage();
      } else {
        this.prevDis = true;
      }
    },
    /** 下一步 */
    handleNext() {
      if (this.currentImg.index < this.canvasStore.length - 1) {
        this.prevDis = false;
        this.currentImg.index += 1;
        this.currentImg.index == this.canvasStore.length - 1
          ? (this.nextDis = true)
          : (this.nextDis = false);
        this.currentImg.url = this.canvasStore[this.currentImg.index];
        this.currentImg.scale = 1;
        this.handleDrawImage();
      } else {
        this.nextDis = true;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.board {
  width: 100%;
  height: 80%;
  canvas {
    position: absolute;
  }
  #ctx_front {
    z-index: 5;
  }
  #ctx_back {
    z-index: 3;
  }
  #ctx_base {
    z-index: 1;
  }
  #text {
    position: absolute;
    z-index: -1;
    resize: none;
    outline: none;
    border: 1px dashed #eeeeee;
    overflow: hidden;
    background: transparent;
    line-height: 30px;
    display: none;
  }
}
.tools {
  display: flex;
  background: #ffffff;
}
.settings {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border: 1px solid #eeeeee;
  border-top: 0;
  .tool_item {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
  }
  button {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid #eeeeee;
    outline: none;
    position: relative;
    flex-wrap: nowrap;
    svg {
      color: #333333;
      font-size: 18px;
    }
    span {
      white-space: nowrap;
    }
  }
  .slide {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    svg {
      font-size: 18px;
    }
  }
}
.bars {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  border: 1px solid #eeeeee;
  display: flex;
  .tool_item {
    &:not(:last-of-type) {
      border-bottom: 1px solid #dddddd;
    }
    svg {
      font-size: 24px;
      margin-right: 8px;
    }
    span {
      font-size: 18px;
    }
    &:hover {
      svg {
        color: dodgerblue;
      }
      span {
        color: dodgerblue;
      }
    }
  }
  .activeTool {
    border-color: dodgerblue !important;
    svg {
      color: dodgerblue;
    }
    span {
      color: dodgerblue;
    }
  }
}
</style>
