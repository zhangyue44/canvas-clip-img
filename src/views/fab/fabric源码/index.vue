<template>
  <div class="h-full w-full">
    <canvas id="editor-canvas"></canvas>
  </div>
</template>

<script>
import fabric from "fabric";
import mixin from "./mixin.js";

export default {
  mixins: [mixin],
  created() {
    this.width = null;
    this.height = null;
    this._offset = null;
    this.canvas = null;
    this.lowerCanvasEl = null; // 真实的canvas
    this.contextContainer = null;
    this.upperCanvasEl = null; // 下一层的canvas
    this.contextTop = null;
    this.cacheCanvasEl = null; // 缓存的canvas ?
    this.contextCache = null;
    this.isDrawingMode = false;
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.canvas = this.fabricCanvas("editor-canvas", {
        width: 800,
        height: 600,
      });
    },
  },
};
</script>
