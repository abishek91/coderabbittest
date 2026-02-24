(function initSnakeApp() {
  const board = document.getElementById("board");
  const scoreText = document.getElementById("score");
  const statusText = document.getElementById("status");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const controlButtons = document.querySelectorAll("[data-direction]");
  const ctx = board.getContext("2d");

  const gridSize = 20;
  const cellSize = board.width / gridSize;
  const tickMs = 130;

  let state = SnakeLogic.createInitialState({ width: gridSize, height: gridSize, rng: Math.random });
  let paused = false;

  function drawBoardLines() {
    ctx.strokeStyle = "#e3e5e8";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i += 1) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, board.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(board.width, pos);
      ctx.stroke();
    }
  }

  function drawCell(point, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
      point.x * cellSize + 1,
      point.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2
    );
  }

  function render() {
    ctx.clearRect(0, 0, board.width, board.height);
    drawBoardLines();

    for (let i = 0; i < state.snake.length; i += 1) {
      const color = i === 0 ? "#1f2937" : "#374151";
      drawCell(state.snake[i], color);
    }

    if (state.food) {
      drawCell(state.food, "#dc2626");
    }

    scoreText.textContent = "Score: " + state.score;
    if (state.status === "over") {
      statusText.textContent = "Game Over";
    } else if (paused) {
      statusText.textContent = "Paused";
    } else {
      statusText.textContent = "Running";
    }

    pauseBtn.textContent = paused ? "Resume" : "Pause";
  }

  function applyDirectionName(name) {
    if (!SnakeLogic.DIRECTIONS[name]) {
      return;
    }
    state = SnakeLogic.setDirection(state, SnakeLogic.DIRECTIONS[name]);
  }

  function togglePause() {
    if (state.status === "over") {
      return;
    }
    paused = !paused;
    render();
  }

  function restart() {
    state = SnakeLogic.restartGame(state, Math.random);
    paused = false;
    render();
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "arrowup" || key === "w") {
      event.preventDefault();
      applyDirectionName("UP");
    } else if (key === "arrowdown" || key === "s") {
      event.preventDefault();
      applyDirectionName("DOWN");
    } else if (key === "arrowleft" || key === "a") {
      event.preventDefault();
      applyDirectionName("LEFT");
    } else if (key === "arrowright" || key === "d") {
      event.preventDefault();
      applyDirectionName("RIGHT");
    } else if (key === " ") {
      event.preventDefault();
      togglePause();
    } else if (key === "enter" && state.status === "over") {
      event.preventDefault();
      restart();
    }
  });

  for (let i = 0; i < controlButtons.length; i += 1) {
    controlButtons[i].addEventListener("click", () => {
      applyDirectionName(controlButtons[i].dataset.direction);
    });
  }

  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restart);

  setInterval(() => {
    if (paused || state.status === "over") {
      return;
    }
    state = SnakeLogic.stepGame(state, Math.random);
    render();
  }, tickMs);

  render();
})();
