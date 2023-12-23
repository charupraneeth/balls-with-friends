import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, "public")));

const canvas = { width: 480, height: 320 };
const paddleWidth = 75;
const paddleHeight = 10;
const ballRadius = 6;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let paddleX1 = (canvas.width - paddleWidth) / 2;
let paddleX2 = (canvas.width - paddleWidth) / 2;
let rightPressed1 = false;
let leftPressed1 = false;
let rightPressed2 = false;
let leftPressed2 = false;

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  dx = 2;
  dy = -2;
}

function collisionDetection() {
  // Bounce off the left and right walls
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  if (y + dy < ballRadius) {
    resetBall();
  } else if (y + dy > canvas.height - ballRadius) {
    // If the ball hits the bottom wall
    resetBall();
  }
  // Check for collision with the top paddle
  else if (y + dy < ballRadius + paddleHeight && y > ballRadius) {
    if (x > paddleX2 && x < paddleX2 + paddleWidth) {
      dy = -dy;
      y = ballRadius + paddleHeight; // Adjust ball position so it doesn't sink into the paddle
    }
  }

  // Check for collision with the bottom paddle
  else if (
    y + dy > canvas.height - ballRadius - paddleHeight &&
    y < canvas.height - ballRadius
  ) {
    if (x > paddleX1 && x < paddleX1 + paddleWidth) {
      dy = -dy;
      y = canvas.height - ballRadius - paddleHeight; // Adjust ball position so it doesn't sink into the paddle
    }
  }
}

function gameLoop() {
  collisionDetection();
  // console.log({ rightPressed1, rightPressed2, leftPressed1, leftPressed2 });
  if (rightPressed1 && paddleX1 < canvas.width - paddleWidth) {
    paddleX1 += 7;
  } else if (leftPressed1 && paddleX1 > 0) {
    paddleX1 -= 7;
  }

  if (rightPressed2 && paddleX2 < canvas.width - paddleWidth) {
    paddleX2 += 7;
  } else if (leftPressed2 && paddleX2 > 0) {
    paddleX2 -= 7;
  }

  x += dx;
  y += dy;

  io.emit("new-state", { x, y, dx, dy, paddleX1, paddleX2 });
}

setInterval(gameLoop, 25);

io.on("connection", async (socket) => {
  console.log("new socket connected: ", socket.id);
  socket.emit("new-state", { x, y, dx, dy, paddleX1, paddleX2 });
  socket.on("new-state", (updatedState) => {
    console.log(updatedState);
    gameState = { ...updatedState };
  });

  socket.on("key-press-update", (keyPressUpdates) => {
    console.log({ keyPressUpdates });
    leftPressed1 = keyPressUpdates.leftPressed1;
    leftPressed2 = keyPressUpdates.leftPressed2;
    rightPressed1 = keyPressUpdates.rightPressed1;
    rightPressed2 = keyPressUpdates.rightPressed2;
  });
});

const port = process.env.PORT || 1337;

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});
