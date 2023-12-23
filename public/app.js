const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 480;
canvas.height = 320;
document.body.appendChild(canvas);

const socket = new io();

// Game constants and variables
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

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#000d";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle1() {
  ctx.beginPath();
  ctx.rect(paddleX1, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle2() {
  ctx.beginPath();
  ctx.rect(paddleX2, 0, paddleWidth, paddleHeight);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle1();
  drawPaddle2();

  requestAnimationFrame(draw);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed1 = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed1 = true;
  } else if (e.key === "D" || e.key === "d") {
    rightPressed2 = true;
  } else if (e.key === "A" || e.key === "a") {
    leftPressed2 = true;
  }
  console.log("down emit");
  socket.emit("key-press-update", {
    rightPressed1,
    rightPressed2,
    leftPressed1,
    leftPressed2,
  });
});

document.addEventListener("keyup", function (e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed1 = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed1 = false;
  } else if (e.key === "D" || e.key === "d") {
    rightPressed2 = false;
  } else if (e.key === "A" || e.key === "a") {
    leftPressed2 = false;
  }

  console.log("up emit");

  socket.emit("key-press-update", {
    rightPressed1,
    rightPressed2,
    leftPressed1,
    leftPressed2,
  });
});

if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", handleTilt, true);
}
let prevTilt;

function handleTilt(event) {
  // Gamma is the left-to-right tilt in degrees, where right is positive
  if (prevTilt == undefined) {
    prevTilt = event.gamma;
    return;
  }
  const tilt = event.gamma;
  if (prevTilt == tilt) return;

  prevTilt = tilt;

  if (tilt != 0) {
    socket.emit("key-press-update", {
      rightPressed1,
      rightPressed2,
      leftPressed1: tilt < 0,
      leftPressed2: tilt > 0,
    });
  }
}

socket.on("new-state", (updatedState) => {
  console.log(updatedState);
  x = updatedState.x;
  y = updatedState.y;
  dx = updatedState.dx;
  dy = updatedState.dy;
  paddleX1 = updatedState.paddleX1;
  paddleX2 = updatedState.paddleX2;
});

draw();
