let rocket;
let aliens = [];
let stars = [];

let lives = 3;
let score = 0;
let gameOver = false;
let leaderboard = [];

let alienTimer = 0;
let alienSpeed = 3;
let hitCooldown = 0;
let rocketAni;

function preload() {
  rocketAni = loadAni("Rocket.png", {
    width: 64,
    height: 64,
    frames: 4
  });
}

function setup() {
  new Canvas(800, 500);

  rocket = new Sprite(90, height/2, 50, 35);
  rocket.addAni("fly", rocketAni);
  rocket.ani = "fly";
  rocket.ani.frameDelay = 8;

  rocket.scale = 3;
  rocket.rotationLock = true;

  for (let i = 0; i < 140; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.01, 0.05),
      base: random(120, 255)
    });
  }
}

function draw() {
  background("black");
  drawStars();

  if (!gameOver) {
    runGame();
  }
  else {
    showGameOver();
  }

  drawHUD();
}

function runGame() {
  score++;
  hitCooldown--;

  alienSpeed = 3 + score/900;
  let spawnRate = max(25, 80 - score/120);

  if (kb.pressing("up")) {
    rocket.vel.y = -5;
  }
  else if (kb.pressing("down")) {
    rocket.vel.y = 5;
  }
  else {
    rocket.vel.y = 0;
  }

  rocket.x = 90;
  rocket.y = constrain(rocket.y, 35, height - 35);

  alienTimer++;

  if (alienTimer > spawnRate) {
    spawnAlien();
    alienTimer = 0;
  }

  for (let i = aliens.length - 1; i >= 0; i--) {
    let alien = aliens[i];

    alien.vel.x = -alienSpeed;

    if (alien.x < -80) {
      alien.remove();
      aliens.splice(i, 1);
      continue;
    }

    if (hitCooldown <= 0 && rocket.overlap(alien)) {
      loseLife(alien);
      aliens.splice(i, 1);
    }
  }
}

function spawnAlien() {
  let size = random(25, 70);

  let alien = new Sprite(width + 60, random(40, height - 40), size, size);
  alien.color = color(random(80, 255), random(80, 255), random(80, 255));
  alien.vel.x = -alienSpeed;
  alien.rotationSpeed = random(-4, 4);
  alien.text = "👾";
  alien.textSize = size*0.75;

  aliens.push(alien);
}

function loseLife(alien) {
  alien.remove();
  lives--;
  hitCooldown = 60;

  rocket.vel.y = 2;
  rocket.rotation = 15;
  rocket.tint = "gray";

  setTimeout(() => {
    if (!gameOver) {
      rocket.y = height/2;
      rocket.rotation = 0;
      rocket.tint = "white";
    }
  }, 900);

  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  gameOver = true;

  rocket.vel.y = 2;
  rocket.rotationSpeed = 2;
  rocket.tint = "gray";

  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);
}

function drawStars() {
  noStroke();

  for (let s of stars) {
    let sparkle = sin(frameCount*s.speed)*80;
    let brightness = constrain(s.base + sparkle, 80, 255);

    fill(brightness);
    circle(s.x, s.y, s.size);
  }
}

function drawHUD() {
  fill("white");
  textFont("monospace");
  textSize(22);
  textAlign(LEFT, BOTTOM);
  text("POINTS: " + score, 20, height - 20);

  textAlign(RIGHT, BOTTOM);
  textSize(30);

  let hearts = "";
  for (let i = 0; i < lives; i++) {
    hearts += "💚";
  }

  fill("red");
  text(hearts, width - 20, height - 15);
}

function showGameOver() {
  fill("white");
  textFont("monospace");
  textAlign(CENTER, CENTER);

  textSize(52);
  text("GAME OVER", width/2, 95);

  textSize(24);
  text("FINAL SCORE: " + score, width/2, 155);

  textSize(22);
  for (let i = 0; i < 5; i++) {
    let s = leaderboard[i] || 0;
    text((i + 1) + ". " + s, width/2, 270 + i*32);
  }

  textSize(18);
  text("PRESS SPACE TO RESTART", width/2, height - 35);

  if (kb.pressed("space")) {
    restartGame();
  }
}

function restartGame() {
  lives = 3;
  score = 0;
  gameOver = false;
  alienTimer = 0;
  alienSpeed = 3;
  hitCooldown = 0;

  for (let alien of aliens) {
    alien.remove();
  }
  aliens = [];

  rocket.x = 90;
  rocket.y = height/2;
  rocket.vel.y = 0;
  rocket.vel.x = 0;
  rocket.rotation = 0;
  rocket.rotationSpeed = 0;
  rocket.tint = "white";
}