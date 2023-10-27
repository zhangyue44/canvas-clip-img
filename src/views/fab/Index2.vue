<template>
  <div
    class="editorBox fixe top-0 right-0 bottom-0 left-0 overflow-auto"
    :class="{ active: visible }"
  >
    <span class="close-btn absolute top-5 right-5" @click="cancel">
      <!-- <Icon name="common_cross" class="text-4xl"/> -->
    </span>
    <div class="tool-btn absolute top-2 left-1/2 flex flex-col items-center">
      <div>
        <button
          :class="{ 'is-icon': true, active: !isActive }"
          title="选择对象"
          @click="resetDraw"
        >
          <!-- <Icon name="mouse@build-platform" /> -->
        </button>
        <button
          :class="{ 'is-icon': true, active: isActive === 'draw' }"
          title="绘制"
          @click="openDrawing"
        >
          <!-- <Icon name="icon_edit@build-platform" /> -->
        </button>
        <button
          :class="{ 'is-icon': true, active: isActive === 'text' }"
          title="文本"
          @click="openText"
        >
          <!-- <Icon name="paragraph@ocge" /> -->
        </button>
        <button
          v-show="activeTingShow"
          :class="{ 'is-icon': true }"
          title="删除"
          @click="deleteThing"
        >
          <!-- <Icon name="common_transhcan" /> -->
        </button>
        <button
          :class="{ 'is-icon': true }"
          title="替换原图"
          @click="saveToSurvery"
        >
          <!-- <Icon name="icon_right_sm@cotech" /> -->
        </button>
        <button
          :class="{ 'is-icon': true }"
          title="保存本地"
          @click="saveToLocal"
        >
          <!-- <Icon name="common_save_l@yabby" /> -->
        </button>
      </div>
      <div
        :class="{
          colorbox: true,
          'active-colorbox': isActive || activeTingShow,
        }"
        class="flex items-center gap-x-2 mt-2"
      >
        <div
          v-for="item in colorList"
          :key="item.id"
          :class="{ 'color-btn': true, activebtn: isShowBorder(item.value) }"
          :style="`backgroundColor:${item.value}`"
          @click="colorChange(item)"
        />
      </div>
    </div>
    <canvas id="editorcanvas" />
  </div>
</template>

<script>
import { fabric } from "fabric";
import { debounce } from "lodash";
import srcUrl from "@/views/imgClip/sss.jpg";
// import { COSS } from "@/class/oss.js";
// import {
//   addPositionAttachments,
//   deletePositionAttachment,
// } from "@/api/esurvey/mapNew.js";

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
    // type: { type: String, default: "position" },
    // id: { type: [String, Number], default: "" },
  },
  data() {
    return {
      loading: false,
      useSrcUrl: srcUrl,
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
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.canvas = new fabric.Canvas("editorcanvas", {
          backgroundVpt: false,
          selection: false,
        });
        this.canvas.freeDrawingBrush.width = 10;
        this.canvas.freeDrawingBrush.limitedToCanvasSize = true;
        this.canvas.on("mouse:up", (e) => {
          const activeObj = this.canvas.getActiveObject();
          this.activeThingchange(activeObj);
          if (!activeObj) {
            if (this.isActive === "draw") return;
            this.activeChange(null);
          }
        });
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = this.useSrcUrl;
        // img.src = this.file.playUrl;
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
          this.domData.height = height;
          this.initCanvas(width, height, img.width, img.height);
        };
      } else {
        if (this.canvas) {
          this.canvas.dispose();
          this.canvas = null;
        }
        this.activeThingchange(null);
        this.isActive = null;
        this.domData = {
          imgWidth: null,
          imgHeight: null,
          width: null,
          height: null,
          radio: null,
        };
      }
    },
  },
  beforeDestroy() {
    if (this.canvas) {
      const node = this.canvas.getElement();
      this.canvas.dispose();
      node.remove();
      this.canvas = null;
    }
    const node = document.querySelector(".editorBox");
    if (node) node.remove(node);
  },
  created() {
    this.canvas = null;
    this.activeThing = null;
    this.colorDrawValue = this.colorList[0].value;
    this.colorTextValue = this.colorList[0].value;
    this.domData = {
      imgWidth: null,
      imgHeight: null,
      width: null,
      height: null,
      radio: null,
    };
  },
  mounted() {
    const node = document.querySelector(".editorBox");
    if (node) document.body.append(node);
    // this.COSSInstance = new COSS({
    //   serviceName: "esurvey",
    // });
  },
  methods: {
    initCanvas(width, height, imgWidth, imgHeight) {
      this.canvas.setDimensions({ width, height });
      this.$nextTick(() => {
        this.canvas.setBackgroundImage(
          // this.file.playUrl,
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
        this.canvas.discardActiveObject();
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
      text.center();
      this.canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
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
    saveToLocal() {
      this.loading = true;
      const { imgWidth, imgHeight, width, height } = this.domData;
      this.initCanvas(imgWidth, imgHeight, imgWidth, imgHeight);
      this.canvas.viewportTransform = [
        imgWidth / width,
        0,
        0,
        imgHeight / height,
        0,
        0,
      ];
      setTimeout(() => {
        const dataURL = this.canvas.toDataURL({
          format: "jpeg",
          quality: 1,
          width: imgWidth,
          height: imgHeight,
        });
        this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        this.initCanvas(width, height, imgWidth, imgHeight);
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
      this.loading = true;
      const { imgWidth, imgHeight, width, height } = this.domData;
      this.initCanvas(imgWidth, imgHeight, imgWidth, imgHeight);
      this.canvas.viewportTransform = [
        imgWidth / width,
        0,
        0,
        imgHeight / height,
        0,
        0,
      ];
      setTimeout(async () => {
        const dataURL = this.canvas.toDataURL({
          format: "jpeg",
          quality: 1,
          width: imgWidth,
          height: imgHeight,
        });
        this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        this.initCanvas(width, height, imgWidth, imgHeight);
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
.editorBox {
  z-index: 5000;
  background-color: rgba(0, 0, 0, 0.9);
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
