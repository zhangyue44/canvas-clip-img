export default {
  methods: {
    fabricCanvas(el, options) {
      this._initOptions(options);
      this._initIdCanvas(el, options);
      this._initOtherCanvas();
      this._offset = this.getElementOffset(this.lowerCanvasEl);
      this._initEvents();
    },
    _initOptions(options) {
      this.width = options.width;
      this.height = options.height;
    },
    _initIdCanvas(el, options) {
      this.lowerCanvasEl = document.getElementById(el);
      this.lowerCanvasEl.classList.add('lower-canvas');
      this._applyCanvasStyle(this.lowerCanvasEl);
      this.contextContainer = this.lowerCanvasEl.getContext('2d');
      // setBackgroundImage
    },
    _initOtherCanvas() {
      const div = document.createElement('div');
      div.classList.add('canvas-container');
      this.setStyle(div, {
        width: `${this.width}px`,
        height: `${this.height}px`,
        position: 'relative',
        'touch-action': 'none',
        'user-select': 'none',
      });
      this.upperCanvasEl = document.createElement('canvas');
      this.upperCanvasEl.className = 'upper-canvas';
      this._applyCanvasStyle(this.upperCanvasEl);
      const el = this.lowerCanvasEl.parentNode;
      el.replaceChild(div, this.lowerCanvasEl);
      div.appendChild(this.lowerCanvasEl);
      div.appendChild(this.upperCanvasEl);
      this.contextTop = this.upperCanvasEl.getContext('2d');
    },
    _initEvents() {
      const _this = this;
      this._onMouseDown = function (e) {
        _this.__onMouseDown(e);
        document.addEventListener('mouseup', _this._onMouseUp);
        document.addEventListener('mousemove', _this._onMouseMove);
        _this.upperCanvasEl.removeEventListener('mousemove', _this._onMouseMove);
      };
      this._onMouseUp = function (e) {
        // _this.__onMouseUp(e);
        document.removeEventListener('mouseup', _this._onMouseUp);
        document.removeEventListener('mousemove', _this._onMouseMove);
        _this.upperCanvasEl.addEventListener('mousemove', _this._onMouseMove);
      };
      this._onMouseMove = function (e) {
        e.preventDefault && e.preventDefault();
        // _this.__onMouseMove(e);
      };
      this._onResize = function () {
        _this.calcOffset();
      };
      this.upperCanvasEl.addEventListener('mousedown', this._onMouseDown);
      this.upperCanvasEl.addEventListener('mousemove', this._onMouseMove);
    },
    _applyCanvasStyle(el) {
      this.setStyle(el, {
        position: 'absolute',
        width: `${this.width}px`,
        height: `${this.height}px`,
        left: 0,
        top: 0,
        'touch-action': 'none',
        'user-select': 'none',
      });
      el.width = this.width;
      el.height = this.height;
    },
    setStyle(el, styles) {
      const elStyle = el.style;
      for (const property in styles) {
        elStyle[property] = styles[property];
      }
    },
    getElementOffset(element) {
      let valueT = 0;
      let valueL = 0;
      do {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      }
      while (element);
      return ({ left: valueL, top: valueT });
    },
    __onMouseDown(e) {
      console.log(e);
      let pointer;
      if (this.isDrawingMode) {
        // 自由绘制
      } else {
        // ssd
      }
    },
    getPointer(e) {
      let element = e.target;
      let scrollLeft = 0;
      let scrollTop = 0;
      let firstFixedAncestor;
      while (element && element.parentNode && !firstFixedAncestor) {
        element = element.parentNode;
        if (element !== document && this.getElementPosition(element) === 'fixed') firstFixedAncestor = element;

        scrollLeft += element.scrollLeft || 0;
        scrollTop += element.scrollTop || 0;
      }
      return {
        x: (e.clientX || 0) + scrollLeft,
        y: (e.clientY || 0) + scrollTop,
      };
    },
    getElementPosition(el) {
      let value = el.style.position;
      if (!value && el.currentStyle) value = el.currentStyle.position;
      return value;
    },
  },
};




rectRender(ctx, obj) {
      const {
        w, h, rx, ry,
      } = obj;
      const x = -w / 2;
      const y = -h / 2;
      ctx.beginPath();
      ctx.moveTo(x + rx, y);
      ctx.lineTo(x + w - rx, y);
      ctx.lineTo(x + w, y + h - ry);
      ctx.lineTo(x + rx, y + h);
      ctx.lineTo(x, y + ry);
      ctx.closePath();
      ctx.fill();
    },