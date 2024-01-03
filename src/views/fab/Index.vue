<template>
  <div
    v-loading="loading"
    :class="`${name} commonBox fixed top-0 right-0 bottom-0 left-0 overflow-auto ${
      visible ? 'active' : ''
    }`"
  >
    <span class="close-btn fixed top-5 right-5" @click="cancel"
      ><Icon name="common_cross" class="text-4xl"
    /></span>
    <div class="tool-btn fixed top-2 left-1/2 flex flex-col items-center">
      <div>
        <el-button
          :class="{ 'is-icon': true, active: !isActive }"
          title="选择对象"
          @click="resetDraw"
        >
          <Icon name="mouse@build-platform" />
        </el-button>
        <el-button
          :class="{ 'is-icon': true, active: isActive === 'draw' }"
          title="绘制"
          @click="openDrawing"
        >
          <Icon name="icon_edit@build-platform" />
        </el-button>
        <el-button
          :class="{ 'is-icon': true, active: isActive === 'text' }"
          title="文本"
          @click="openText"
        >
          <Icon name="paragraph@ocge" />
        </el-button>
        <el-button
          v-show="activeTingShow"
          :class="{ 'is-icon': true }"
          title="删除"
          @click="deleteThing"
        >
          <Icon name="common_transhcan" />
        </el-button>
        <el-button
          :class="{ 'is-icon': true }"
          title="旋转图片"
          @click="revolveCanvas"
        >
          <Icon name="common_rotate_right" />
        </el-button>
        <el-button
          :class="{ 'is-icon': true }"
          title="替换原图"
          @click="saveToSurvery"
        >
          <Icon name="icon_right_sm@cotech" />
        </el-button>
        <el-button
          :class="{ 'is-icon': true }"
          title="保存本地"
          @click="saveToLocal"
        >
          <Icon name="common_save_l@yabby" />
        </el-button>
      </div>
      <div class="flex items-center mt-2">
        <div
          :class="{
            colorbox: true,
            'active-colorbox': isActive || activeTingShow,
          }"
          class="flex items-center gap-x-2"
        >
          <div
            v-for="item in colorList"
            :key="item.id"
            :class="{ 'color-btn': true, activebtn: isShowBorder(item.value) }"
            :style="`backgroundColor:${item.value}`"
            @click="colorChange(item)"
          />
        </div>
        <div v-show="showLine" class="ml-2 flex items-center">
          <span>画笔粗细:</span>
          <el-slider
            v-model="lineWidthValue"
            class="w-16 ml-2"
            :min="1"
            :max="10"
            @drag-end="drawWidthChange"
          />
        </div>
      </div>
    </div>
    <canvas id="editorcanvas" />
  </div>
</template>

<script>
import { fabric } from "fabric";
import { debounce } from "lodash";
import { COSS } from "@/class/oss.js";
import {
  addPositionAttachments,
  deletePositionAttachment,
} from "@/api/esurvey/mapNew.js";

function dataURLtoFile(dataurl, filename) {
  // base64 -> file
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
export default {
  props: {
    visible: { type: Boolean, default: false },
    file: { type: Object, default: () => null },
    type: { type: String, default: "position" },
    id: { type: [String, Number], default: "" },
    name: { type: String, default: "editorBoxZy" },
  },
  data() {
    return {
      loading: false,
      isActive: null,
      colorList: [
        { id: 1, value: "rgb(255, 0, 0)" },
        { id: 2, value: "rgb(255, 131, 43)" },
        { id: 3, value: "rgb(255, 204, 0)" },
        { id: 4, value: "rgb(29, 184, 76)" },
        { id: 5, value: "rgb(145, 35, 166)" },
        { id: 6, value: "rgb(255, 255, 255)" },
        { id: 7, value: "rgb(9, 10, 10)" },
      ],
      colorDrawValue: null,
      colorTextValue: null,
      activeTingShow: false,
      activeThing: null,
      lineWidthValue: 4,
    };
  },
  computed: {
    showLine() {
      return (
        this.isActive === "draw" ||
        (this.activeTingShow && !this.activeThing?.text)
      );
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.canvas = new fabric.Canvas("editorcanvas", {
          selection: false, // 不允许从画板框选，但允许选中元素
          centeredRotation: true, // true时Canvas上的所有对象使用中间点（而不是默认的左上角）作为旋转的原点
          // backgroundVpt: false, // 锁定背景图，不受画板缩放移动的影响
          // isDrawingMode: true, // 开启自由绘制
          // selectionFullyContained: true, // 只选择完全包含在拖动选择矩形中的元素
        });
        this.canvas.freeDrawingBrush.width = Number(this.lineWidthValue); // 画笔的宽度
        this.canvas.freeDrawingBrush.limitedToCanvasSize = true; // 自由绘制被限制为画布大小
        this.canvas.on("mouse:down", (opt) => {
          const activeObj = this.canvas.getActiveObject();
          this.activeThingchange(activeObj);
          if (!activeObj) {
            if (this.isActive === "draw") return;
            this.activeChange(null);
          }
          const evt = opt.e;
          if (!this.isActive && !activeObj) {
            this.dragging.open = true;
            this.dragging.lastPosX = evt.clientX;
            this.dragging.lastPosY = evt.clientY;
          }
        });
        this.canvas.on("mouse:move", (opt) => {
          if (this.dragging.open) {
            const evt = opt.e;
            const vpt = this.canvas.viewportTransform;
            vpt[4] += evt.clientX - this.dragging.lastPosX;
            vpt[5] += evt.clientY - this.dragging.lastPosY;
            this.canvas.requestRenderAll(); // 异步更新画板，提升性能
            this.dragging.lastPosX = evt.clientX;
            this.dragging.lastPosY = evt.clientY;
          }
        });
        this.canvas.on("mouse:up", (e) => {
          if (this.dragging.open) {
            this.canvas.setViewportTransform(this.canvas.viewportTransform);
            this.dragging.open = false;
          }
        });
        this.canvas.on("mouse:wheel", (opt) => {
          const delta = opt.e.deltaY; // 正值为放大
          let zoom = this.canvas.getZoom();
          zoom *= 0.999 ** delta;
          if (zoom > 20) zoom = 20;
          if (zoom < 1) zoom = 1;
          this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom); // 以鼠标指针来缩放画板
          // this.canvas.setZoom(zoom) // 以画板原点来缩放画板
        });
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = this.file.playUrl;
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
          this.domData.imgWidth = img.width;
          this.domData.imgHeight = img.height;
          this.domData.width = width;
          this.domData.originWidth = width;
          this.domData.height = height;
          this.domData.originHeight = height;
          this.initCanvas(width, height, img.width, img.height, {
            scaleWidth: width,
            scaleHeight: height,
          });
        };
      } else {
        if (this.canvas) {
          this.canvas.dispose();
          this.canvas = null;
        }
        this.activeThingchange(null);
        this.isActive = null;
        this.rotateValue = 0;
        this.domData = {
          imgWidth: null,
          imgHeight: null,
          width: null,
          originWidth: null,
          height: null,
          originHeight: null,
        };
        this.dragging = {
          open: false,
          lastPosX: null,
          lastPosY: null,
        };
      }
    },
  },
  beforeDestroy() {
    if (this.canvas) {
      const node = this.canvas.getElement(); // 获取canvas元素
      this.canvas.dispose(); // 清空所有绘制实例与事件侦听,销毁fabric生成的实例
      node.remove();
      this.canvas = null;
    }
    const node = document.querySelector(`.${this.name}`);
    if (node) node.remove();
  },
  created() {
    this.rotateValue = 0;
    this.canvas = null;
    this.activeThing = null;
    this.colorDrawValue = this.colorList[0].value;
    this.colorTextValue = this.colorList[0].value;
    this.domData = {
      imgWidth: null,
      imgHeight: null,
      width: null,
      originWidth: null,
      height: null,
      originHeight: null,
    };
    this.dragging = {
      open: false,
      lastPosX: null,
      lastPosY: null,
    };
  },
  mounted() {
    const node = document.querySelector(`.${this.name}`);
    if (node) document.body.append(node);
    this.COSSInstance = new COSS({
      serviceName: "esurvey",
    });
  },
  methods: {
    initCanvas(width, height, imgWidth, imgHeight, info) {
      this.canvas.setDimensions({ width, height });
      this.$nextTick(() => {
        this.canvas.setBackgroundImage(
          this.file.playUrl,
          this.canvas.renderAll.bind(this.canvas),
          {
            imgWidth,
            imgHeight,
            scaleX: info.scaleWidth / imgWidth,
            scaleY: info.scaleHeight / imgHeight,
            left: width / 2,
            top: height / 2,
            angle: this.rotateValue,
            originX: "center",
            originY: "center",
            crossOrigin: "anonymous",
          }
        );
      });
    },
    activeThingchange(val) {
      this.activeThing = val;
      this.activeTingShow = !!val;
    },
    deleteThing() {
      if (!this.activeThing) return;
      this.canvas.remove(this.activeThing);
      this.activeThingchange(null);
    },
    resetDraw: debounce(function () {
      if (this.isActive) {
        this.canvas.discardActiveObject(); // 抛弃当前处于活动状态的Object
        this.canvas.renderAll();
      }
      this.activeChange(null);
      this.drawModeOpen(false);
    }, 200),
    openDrawing: debounce(function () {
      if (this.isActive === "draw") return;
      this.activeChange("draw");
      this.drawModeOpen(true);
      this.drawFreeColor();
    }, 200),
    drawModeOpen(val) {
      this.canvas.isDrawingMode = val;
    },
    drawFreeColor() {
      this.canvas.freeDrawingBrush.color = this.colorDrawValue;
    },
    drawWidthChange() {
      if (this.isActive === "draw") {
        this.canvas.freeDrawingBrush.width = Number(this.lineWidthValue || 4);
      } else if (this.activeTingShow && !this.activeThing?.text) {
        this.activeThing.set("strokeWidth", Number(this.lineWidthValue || 4));
        this.canvas.renderAll();
      }
    },
    openText: debounce(function () {
      if (this.isActive === "text") return;
      if (this.isActive === "draw") this.drawModeOpen(false);
      this.activeChange("text");
      const text = new fabric.IText("请输入文本", {
        fill: this.colorTextValue,
      });
      text.setControlsVisibility({
        mt: false,
        mr: false,
        mb: false,
        ml: false,
      });
      this.canvas.add(text);
      this.canvas.viewportCenterObject(text); // 屏幕中间
      this.canvas.setActiveObject(text); // 活跃状态
      text.enterEditing(); // 进入编辑状态
      text.selectAll(); // 选中所有文本
      this.activeThingchange(text);
    }, 200),
    textFreeColor(val) {
      this.activeThing.set("fill", val || this.colorTextValue);
      this.canvas.renderAll();
    },
    activeChange(val) {
      this.isActive = val;
    },
    colorChange(item) {
      let colorKey;
      switch (this.isActive) {
        case "draw":
          colorKey = "colorDrawValue";
          break;
        case "text":
          colorKey = "colorTextValue";
          break;
        default:
          colorKey = null;
      }
      if (this.isActive) {
        if (item.value === this[colorKey]) return;
        this[colorKey] = item.value;
      }
      if (!this.isActive) {
        if (this.activeTingShow) {
          if (this.activeThing?.text) {
            this.textFreeColor(item.value);
          } else {
            this.activeThing.set("stroke", item.value);
            this.canvas.renderAll();
          }
        }
      } else if (this.isActive === "draw") {
        this.drawFreeColor();
      } else if (this.isActive === "text") {
        this.textFreeColor();
      }
    },
    isShowBorder(val) {
      let flag = false;
      switch (this.isActive) {
        case "draw":
          flag = this.colorDrawValue === val;
          break;
        case "text":
          flag = this.colorTextValue === val;
          break;
        default:
          flag = false;
      }
      return flag;
    },
    revolveCanvas() {
      const { imgWidth, imgHeight, originWidth, originHeight } = this.domData;
      if (!this.rotateValue || !((this.rotateValue / 90) % 2)) {
        this.domData.width = originHeight;
        this.domData.height = originWidth;
      } else {
        this.domData.width = originWidth;
        this.domData.height = originHeight;
      }
      this.rotateValue += 90;
      this.canvas.clear();
      this.activeThingchange(null);
      this.isActive = null;
      this.initCanvas(
        this.domData.width,
        this.domData.height,
        imgWidth,
        imgHeight,
        {
          scaleWidth: this.domData.originWidth,
          scaleHeight: this.domData.originHeight,
        }
      );
    },
    saveToLocal() {
      const { imgWidth, imgHeight, width, height, initWidth, initHeight } =
        this.commonSaveUtil();
      setTimeout(() => {
        const dataURL = this.canvas.toDataURL({
          format: "jpeg",
          quality: 1,
          width: initWidth,
          height: initHeight,
        });
        this.canvas.backgroundVpt = true;
        this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        this.initCanvas(width, height, imgWidth, imgHeight, {
          scaleWidth: this.domData.originWidth,
          scaleHeight: this.domData.originHeight,
        });
        const link = document.createElement("a");
        link.download = new Date().getTime();
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.loading = false;
      }, 1500);
    },
    saveToSurvery() {
      const { imgWidth, imgHeight, width, height, initWidth, initHeight } =
        this.commonSaveUtil();
      setTimeout(async () => {
        const dataURL = this.canvas.toDataURL({
          format: "jpeg",
          quality: 1,
          width: initWidth,
          height: initHeight,
        });
        this.canvas.backgroundVpt = true;
        this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        this.initCanvas(width, height, imgWidth, imgHeight, {
          scaleWidth: this.domData.originWidth,
          scaleHeight: this.domData.originHeight,
        });
        const file = dataURLtoFile(dataURL, new Date().getTime());
        try {
          const uploadResult = await this.COSSInstance.upload([file]);
          const data = uploadResult.data.successFiles.map((x, index) => ({
            fileId: x.id,
            fileType: "1",
            pictureCategoryId: this.file.pictureCategoryId,
            tag: this.file.tag,
          }));
          Promise.all([
            addPositionAttachments(
              this.type === "position" ? "position" : "area",
              this.id,
              data
            ),
            deletePositionAttachment([this.file.fileId]),
          ]).then((res) => {
            this.loading = false;
            this.$message.success("图片替换成功");
            this.$emit("updateRecord");
            this.cancel();
          });
        } catch (err) {
          this.$message.error("上传图片失败");
          this.loading = false;
        }
      }, 1500);
    },
    commonSaveUtil() {
      this.loading = true;
      this.canvas.backgroundVpt = false;
      const { imgWidth, imgHeight, width, height } = this.domData;
      let initWidth;
      let initHeight;
      if (!this.rotateValue || !((this.rotateValue / 90) % 2)) {
        initWidth = imgWidth;
        initHeight = imgHeight;
      } else {
        initWidth = imgHeight;
        initHeight = imgWidth;
      }
      this.initCanvas(initWidth, initHeight, imgWidth, imgHeight, {
        scaleWidth: imgWidth,
        scaleHeight: imgHeight,
      });
      this.canvas.viewportTransform = [
        initWidth / width,
        0,
        0,
        initHeight / height,
        0,
        0,
      ];
      return { imgWidth, imgHeight, width, height, initWidth, initHeight };
    },
    cancel() {
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .canvas-container {
  margin: 80px auto 0 auto;
}
::v-deep .el-button {
  color: #fff;
  &:hover {
    color: #fff;
  }
}
.el-button--default.is-icon:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.4);
}
.commonBox {
  z-index: 2000;
  background-color: rgba(0, 0, 0);
  display: none;
  &.active {
    display: block;
    position: fixed;
  }
  .close-btn {
    color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.7);
    cursor: pointer;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
  .tool-btn {
    color: #fff;
    transform: translateX(-50%);
    z-index: 5001;
    .active {
      background-color: rgb(255, 131, 43);
    }
    .colorbox {
      visibility: hidden;
      background-color: #6e6e6e;
      padding: 2px;
    }
    .active-colorbox {
      visibility: visible;
    }
    .color-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      &.activebtn {
        border: 2px solid #fff;
      }
    }
  }
}
</style>
