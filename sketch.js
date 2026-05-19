// Retro 80s Rocket Dodge Game - q5play / p5play style

let rocket;
let aliens;
let stars = [];
let lives = 3;
let score = 0;
let gameOver = false;
let leaderboard = [];

let alienTimer = 0;
let alienSpeed = 3;

function setup() {
  createCanvas(800, 500);

  aliens = new Group();

  // Replace this with your already-created animated rocket sprite
rocket = new Sprite(90, height / 2, 64, 64);

rocket.rotationLock = true;

// Load your rocket sprite sheet animation
rocket.spriteSheet = 'Rocket.png';

// Split sprite sheet into frames
rocket.anis.frameDelay = 6;

rocket.addAnis({
  fly: {
    row: 0,
    frames: 4
  }
});

rocket.changeAni('fly');

  // Example rocket animation placeholder
  // rocket.addAni("fly", "rocket1.png", "rocket2.png", "rocket3.png");

  for (let i = 0; i < 120; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(120, 255),
      sparkleSpeed: random(0.02, 0.08)
    });
  }
}

function draw() {
  background(0);

  drawStars();

  if (!gameOver) {
    playGame();
  } else {
    showGameOver();
  }

  drawHUD();
}

function playGame() {
  score += 1;

  // Game gets harder over time
  alienSpeed = 3 + score / 1000;

  // Rocket movement
  if (kb.pressing("up")) {
    rocket.vel.y = -5;
  } else if (kb.pressing("down")) {
    rocket.vel.y = 5;
  } else {
    rocket.vel.y = 0;
  }

  // Keep rocket on left side
  rocket.x = 90;
  rocket.y = constrain(rocket.y, 30, height - 30);

  // Spawn aliens
  alienTimer++;

  let spawnRate = max(25, 80 - score / 150);

  if (alienTimer > spawnRate) {
    spawnAlien();
    alienTimer = 0;
  }

  // Move aliens
  for (let alien of aliens) {
    alien.vel.x = -alienSpeed;

    if (alien.x < -50) {
      alien.remove();
    }

    if (rocket.collides(alien)) {
      loseLife(alien);
    }
  }
}

function spawnAlien() {
  let alienSize = random(25, 70);

  let alien = new aliens.Sprite(width + 50, random(40, height - 40), alienSize, alienSize);
  alien.color = color(random(80, 255), random(50, 255), random(80, 255));
  alien.vel.x = -alienSpeed;
  alien.rotationSpeed = random(-3, 3);

  // Replace with your alien animation/image if you have one
  // alien.addAni("fly", "alien1.png", "alien2.png");

  return alien;
}

function loseLife(alien) {
  alien.remove();
  lives--;

  rocket.vel.y = 3;

  // Rocket loses fire / gets damaged visually
  rocket.color = "gray";

  setTimeout(() => {
    if (!gameOver) {
      rocket.color = "white";
      rocket.y = height / 2;
    }
  }, 800);

  if (lives <= 0) {
    endGame();
  }
}

function endGame() {
  gameOver = true;

  rocket.vel.y = 2;
  rocket.rotationSpeed = 2;
  rocket.color = "darkgray";

  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);
}

function drawStars() {
  noStroke();

  for (let s of stars) {
    s.brightness += sin(frameCount * s.sparkleSpeed) * 2;
    let b = constrain(s.brightness, 100, 255);

    fill(b);
    circle(s.x, s.y, s.size);
  }
}

function drawHUD() {
  fill(255);
  textSize(22);
  textFont("monospace");
  textAlign(LEFT, BOTTOM);
  text("POINTS: " + score, 20, height - 20);

  // Minecraft-style hearts bottom right
  textAlign(RIGHT, BOTTOM);
  textSize(30);

  let hearts = "";
  for (let i = 0; i < lives; i++) {
    hearts += "♥ ";
  }

  fill("red");
  text(hearts, width - 20, height - 15);
}

function showGameOver() {
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  textSize(50);
  text("GAME OVER", width / 2, 110);

  textSize(24);
  text("FINAL SCORE: " + score, width / 2, 170);

  textSize(28);
  text("LEADERBOARD", width / 2, 230);

  textSize(22);
  for (let i = 0; i < 5; i++) {
    let scoreText = leaderboard[i] || 0;
    text((i + 1) + ". " + scoreText, width / 2, 275 + i * 35);
  }

  textSize(18);
  text("Press SPACE to restart", width / 2, height - 40);

  if (kb.presses("space")) {
    restartGame();
  }
}

function restartGame() {
  lives = 3;
  score = 0;
  gameOver = false;
  alienSpeed = 3;
  alienTimer = 0;

  aliens.removeAll();

  rocket.x = 90;
  rocket.y = height / 2;
  rocket.vel.x = 0;
  rocket.vel.y = 0;
  rocket.rotation = 0;
  rocket.rotationSpeed = 0;
  rocket.color = "white";
}