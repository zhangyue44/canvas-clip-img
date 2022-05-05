export function she(vm) {
  vm.scoreDom = document.querySelector("#score");
  vm.restart = document.querySelector("#restart");
  vm.stop = document.querySelector("#stop");
  vm.continue = document.querySelector("#continue");
  vm.startDom = document.querySelector("#start");

  // 蛇类
  class GreedySnake {
    constructor() {
      this.canvas = document.querySelector("#snake");
      this.ctx = this.canvas.getContext("2d");
      this.maxX = 64; // 最大行
      this.maxY = 40; // 最大列
      this.itemWidth = 10; // 每个点的大小
      this.direction = "right"; // up down right left 方向
      this.speed = 150; // ms 速度
      this.isStop = false; // 是否暂停
      this.isOver = false; // 是否结束
      this.isStart = false; // 是否开始
      this.score = 0; // 分数
      this.timer = null; // 移动定时器
      this.j = 1; // 食物闪烁辅助变量
      this.canChange = true; // 是否能改变方向
      this.grid = new Array(); // 计算得到所有坐标点
      for (let i = 0; i < this.maxX; i++) {
        for (let j = 0; j < this.maxY; j++) {
          this.grid.push([i, j]);
        }
      }
      this.drawGridLine(); // 绘制网格
      this.getDirection(); // 控制蛇的方向
    }
    // 绘制网格
    drawGridLine() {
      for (let i = 1; i < this.maxX; i++) {
        this.ctx.moveTo(i * this.itemWidth, 0);
        this.ctx.lineTo(i * this.itemWidth, this.canvas.height);
      }
      for (let i = 1; i < this.maxY; i++) {
        this.ctx.moveTo(0, i * this.itemWidth);
        this.ctx.lineTo(this.canvas.width, i * this.itemWidth);
      }
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#ddd";
      this.ctx.stroke();
    }
    // 控制蛇的方向
    getDirection() {
      // ArrowUp ArrowDown ArrowLeft ArrowRight Space 不能往相反的方向走
      document.onkeydown = (e) => {
        if (!this.canChange) return;
        switch (e.code) {
          case "ArrowUp":
            if (this.direction !== "down") {
              this.direction = "up";
              this.canChange = false;
            }
            break;
          case "ArrowDown":
            if (this.direction !== "up") {
              this.direction = "down";
              this.canChange = false;
            }
            break;
          case "ArrowLeft":
            if (this.direction !== "right") {
              this.direction = "left";
              this.canChange = false;
            }
            break;
          case "ArrowRight":
            if (this.direction !== "left") {
              this.direction = "right";
              this.canChange = false;
            }
            break;
          case "Space":
            // 空格控制暂停与继续
            if (!this.isStop) {
              this.stop();
            } else {
              this.continue();
            }
            break;
        }
      };
    }
    // 暂停游戏
    stop() {
      if (this.isOver) return;
      this.isStop = true;
      vm.startDom.style.display = "block";
      vm.startDom.innerHTML = "暂停";
    }
    // 继续游戏
    continue() {
      if (this.isOver) return;
      this.isStop = false;
      vm.startDom.style.display = "none";
      this.move();
    }
    // 开始
    start() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (!this.isStart) {
        this.isStart = true;
      }
      this.scpre = 0;
      this.speed = 150;
      this.isStop = false;
      this.isOver = false;
      this.direction = "right";
      this.createSnake(); // 画蛇
      this.createFood(); // 画食物
      this.draw(); // 绘制
      this.move(); // 疯狂重绘(让蛇运动起来)
      vm.startDom.style.display = "none";
    }
    // 画蛇
    createSnake() {
      this.snake = [
        [4, 25],
        [3, 25],
        [2, 25],
        [1, 25],
        [0, 25],
      ];
    }
    // 画食物
    createFood() {
      this.food = this.createPos();
      vm.scoreDom.innerHTML = "Score: " + this.score++;
      if (this.speed > 50) {
        this.speed--;
      }
    }
    createPos() {
      let [x, y] = this.grid[(Math.random() * this.grid.length) | 0];
      for (let i = 0; i < this.snake.length; i++) {
        if (this.snake[i][0] == x && this.snake[i][1] == y) {
          return this.createPos();
        }
      }
      return [x, y];
    }
    draw() {
      // 清空画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // 绘制网格线
      this.drawGridLine();
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(
        this.food[0] * this.itemWidth + this.j,
        this.food[1] * this.itemWidth + this.j,
        this.itemWidth - this.j * 2,
        this.itemWidth - +this.j * 2
      );
      this.j ^= 1;
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(
        this.snake[0][0] * this.itemWidth + 0.5,
        this.snake[0][1] * this.itemWidth + 0.5,
        this.itemWidth - 1,
        this.itemWidth - 1
      );
      this.ctx.fillStyle = "red";
      for (let i = 1; i < this.snake.length; i++) {
        this.ctx.fillRect(
          this.snake[i][0] * this.itemWidth + 0.5,
          this.snake[i][1] * this.itemWidth + 0.5,
          this.itemWidth - 1,
          this.itemWidth - 1
        );
      }
    }
    move() {
      if (this.isStop) return;
      let [x, y] = this.snake[0];
      switch (this.direction) {
        case "left":
          x--;
          break;
        case "right":
          x++;
          break;
        case "up":
          y--;
          break;
        case "down":
          y++;
          break;
      }
      // 如果下一步不是食物的位置
      if (x !== this.food[0] || y !== this.food[1]) {
        this.snake.pop(); // 最后一个元素抛弃掉
      } else {
        this.createFood(); // 食物被蛇吃掉，重新绘制一个食物
      }
      if (this.over([x, y])) {
        this.isOver = true;
        vm.startDom.style.display = "block";
        vm.startDom.innerHTML = "结束";
        return;
      }
      if (this.completed()) {
        vm.startDom.style.display = "block";
        vm.startDom.innerHTML = "恭喜您，游戏通关";
        return;
      }
      this.snake.unshift([x, y]);
      this.draw();
      this.canChange = true;
      this.timer = setTimeout(() => this.move(), this.speed);
    }
    // 结束
    over([x, y]) {
      if (x < 0 || x >= this.maxX || y < 0 || y >= this.maxY) {
        // 超出边界
        return true;
      }
      if (this.snake.some((v) => v[0] === x && v[1] === y)) {
        // 自身碰撞
        return true;
      }
    }
    // 完成，游戏胜利
    completed() {
      if (this.snake.length == this.maxX * this.maxY) {
        return true;
      }
    }
  }

  vm.greedySnake = new GreedySnake();
}
