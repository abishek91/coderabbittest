(function initSnakeLogic(global) {
  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
  };

  function toKey(point) {
    return point.x + "," + point.y;
  }

  function isOppositeDirection(current, next) {
    return current.x + next.x === 0 && current.y + next.y === 0;
  }

  function randomEmptyCell(width, height, snake, rng) {
    const occupied = new Set(snake.map(toKey));
    const empty = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const key = x + "," + y;
        if (!occupied.has(key)) {
          empty.push({ x, y });
        }
      }
    }

    if (empty.length === 0) {
      return null;
    }

    const random = typeof rng === "function" ? rng : Math.random;
    const index = Math.floor(random() * empty.length);
    return empty[index];
  }

  function createInitialState(options) {
    const width = options && options.width ? options.width : 20;
    const height = options && options.height ? options.height : 20;
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];

    return {
      width,
      height,
      snake,
      direction: DIRECTIONS.RIGHT,
      nextDirection: DIRECTIONS.RIGHT,
      food: randomEmptyCell(width, height, snake, options && options.rng),
      score: 0,
      status: "running",
      reason: null,
    };
  }

  function setDirection(state, direction) {
    if (state.status !== "running") {
      return state;
    }

    if (!direction || isOppositeDirection(state.direction, direction)) {
      return state;
    }

    return {
      ...state,
      nextDirection: direction,
    };
  }

  function isOutOfBounds(point, width, height) {
    return point.x < 0 || point.y < 0 || point.x >= width || point.y >= height;
  }

  function hasCollision(point, snake) {
    for (let i = 0; i < snake.length; i += 1) {
      if (snake[i].x === point.x && snake[i].y === point.y) {
        return true;
      }
    }
    return false;
  }

  function stepGame(state, rng) {
    if (state.status !== "running") {
      return state;
    }

    const direction = state.nextDirection;
    const currentHead = state.snake[0];
    const nextHead = {
      x: currentHead.x + direction.x,
      y: currentHead.y + direction.y,
    };

    if (isOutOfBounds(nextHead, state.width, state.height)) {
      return {
        ...state,
        status: "over",
        reason: "wall",
      };
    }

    const eating = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
    const collisionBody = eating ? state.snake : state.snake.slice(0, state.snake.length - 1);

    if (hasCollision(nextHead, collisionBody)) {
      return {
        ...state,
        status: "over",
        reason: "self",
      };
    }

    const snake = [nextHead].concat(state.snake);
    if (!eating) {
      snake.pop();
    }

    const nextFood = eating
      ? randomEmptyCell(state.width, state.height, snake, rng)
      : state.food;

    if (eating && nextFood === null) {
      return {
        ...state,
        snake,
        direction,
        nextDirection: direction,
        score: state.score + 1,
        food: null,
        status: "over",
        reason: "filled",
      };
    }

    return {
      ...state,
      snake,
      direction,
      nextDirection: direction,
      food: nextFood,
      score: state.score + (eating ? 1 : 0),
    };
  }

  function restartGame(state, rng) {
    return createInitialState({
      width: state.width,
      height: state.height,
      rng,
    });
  }

  const SnakeLogic = {
    DIRECTIONS,
    createInitialState,
    setDirection,
    stepGame,
    restartGame,
    randomEmptyCell,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SnakeLogic;
  }

  global.SnakeLogic = SnakeLogic;
})(typeof globalThis !== "undefined" ? globalThis : window);
