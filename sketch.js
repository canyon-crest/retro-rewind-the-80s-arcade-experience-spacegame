let rocket; //sets up main variables for sprites, screen, and background
let aliens = [];
let stars = [];
let planets = [];
let powerups = [];
let screen = "title";


let lives = 3; //game stats and difficulty variables
let score = 0;
let gameOver = false;
let isInvis = false;
let easyLeaderboard = [];
let hardLeaderboard = [];
let difficulty = "easy";
let difficultySpeedBonus = 0;
let difficultySpawnBonus = 0;


let alienTimer = 0; //game logic variables
let alienSpeed = 3;
let hitCooldown = 0;
let powerupTimer = 0;
let invisTimer = 0;


let rocketAni; //sprite setup variables
let powerupAnis = {};
let alienImgs = [];
let planetImgs = [];
let invisImg;
let skeleImg;




function preload() { //preloads the rocket animation and array of alien textures
rocketAni = loadAni("Rocket.png", {
  width: 42,
  height: 42,
  frames: 4
});


for (let i = 1; i <= 8; i++) {
  alienImgs.push(loadImage("Alien_" + i + ".png"));
}


for (let i = 1; i <= 5; i++) {
 planetImgs.push(loadImage("planet_" + i + ".png"));
}


powerupAnis[100] = loadAni("100_points.png", {width: 80, height: 80, frames: 6});
powerupAnis[500] = loadAni("500_points.png", {width: 90, height: 90, frames: 4});


invisImg = loadImage("invis.png");
skeleImg = loadImage("skele.png");
}




function windowResized() { //scales the game to the size of the window
 resizeCanvas(windowWidth, windowHeight);
}




function setup() { //creates the rocket and it settings, as well as the array of stars in the background
new Canvas(windowWidth, windowHeight);


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


for (let i = 0; i < 6; i++) {
  planets.push({
   x: random(width),
   y: random(height),
   img: random(planetImgs),
   size: random(40, 110),
   speed: random(0.08, 0.22),
   opacity: random(0.25, 0.45)
  });
}
}




function draw() { //displays the correct screen and creates a background
background("black");
drawStars();
drawPlanets();


if (screen === "title") {
  showTitleScreen();
}
else if(screen === "game") {
 runGame();
 drawHUD();
}
else if (screen === "gameOver") {
  showGameOver();
  drawHUD();
}
}




function startGame() { //starts the game with the correct settings of variables and the correct screen
 lives = 3;
 score = 0;
 gameOver = false;
 isInvis = false;
 invisTimer = 0;
 alienTimer = 0;
 hitCooldown = 0;
 powerupTimer = 0;


 for (let alien of aliens) {
   alien.remove();
 }
 aliens = [];


 for (let pu of powerups) {
   pu.remove();
 }
 powerups = [];


 rocket.x = 90;
 rocket.y = height/2;
 rocket.vel.x = 0;
 rocket.vel.y = 0;
 rocket.rotation = 0;
 rocket.rotationSpeed = 0;
 rocket.tint = "white";


 screen = "game";
}




function runGame() { //contains the actual logic and mechanics of the gameplay, such as alien spawing, timer/score, and speed
score++;
hitCooldown--;


alienSpeed = 4 + difficultySpeedBonus + score/500;
let spawnRate = max(12, 60 - difficultySpawnBonus - score/90);


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
rocket.y = constrain(rocket.y, 60, height - 60);


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


  if (hitCooldown <= 0 && !isInvis &&rocket.overlap(alien)) {
    loseLife(alien);
    aliens.splice(i, 1);
  }
}


 powerupTimer++;
 if (powerupTimer > 300) {
   spawnPowerup();
   powerupTimer = floor(random(-60, 60));
 }


 for (let i = powerups.length - 1; i >= 0; i--) {
   let pu = powerups[i];
   pu.vel.x = -alienSpeed;
   if (pu.x < -80) {
     pu.remove();
     powerups.splice(i, 1);
     continue;
   }
   if (rocket.overlap(pu)) {
     if (!isInvis) {
       if (pu.type === 100 || pu.type === 500) {
         score += pu.type;
       } else if (pu.type === "invis") {
         isInvis = true;
         invisTimer = 300;
         rocket.opacity = 0.35;
       } else if (pu.type === "skele") {
         score = floor(score/2);
       }
     }
     pu.remove();
     powerups.splice(i, 1);
   }
 }


 if (isInvis) {
   invisTimer--;
   if (invisTimer <= 0) {
     isInvis = false;
     rocket.opacity = 1;
   }
 }
}




function spawnPowerup() {
 let roll = random(1);
 let type;
 if (roll < 0.35) type = 100;
 else if (roll < 0.60) type = 500;
 else if (roll < 0.85) type = "invis";
 else type = "skele";


 let powerup = new Sprite(width + 60, random(40, height - 40), 32, 32);
 powerup.rotationLock = true;
 powerup.collider = "rect";
 powerup.vel.x = -alienSpeed;
 powerup.type = type;


 if (type === 100 || type === 500) {
   powerup.addAni("glow", powerupAnis[type]);
   powerup.ani = "glow";
   powerup.ani.frameDelay = 8;
   powerup.scale = 1.5;
 } else if (type === "invis") {
   powerup.img = invisImg;
   powerup.scale = 1;
 } else if (type === "skele") {
   powerup.img = skeleImg;
   powerup.scale = 1;
 }


 powerups.push(powerup);
}




function spawnAlien() { //spawns random aliens at random positions, sizes, and rotations
let size = random(0.75, 2);


let alien = new Sprite(width + 60, random(40, height - 40), 18*size, 18*size);
let randomAlienImage = random(alienImgs);


alien.img = randomAlienImage;
alien.scale = size;
alien.vel.x = -alienSpeed;
alien.rotationSpeed = random(-4, 4);
alien.collider = "circle";
alien.diameter = 10*size;
aliens.push(alien);
}




function loseLife(alien) { //removes a life and respawn with a cool down upon hitting alien, calling end of game
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




function endGame() { //pulls up the game over screen and adds the new score to its respective leaderboard
gameOver = true;
screen = "gameOver";


rocket.vel.y = 2;
rocket.rotationSpeed = 2;
rocket.tint = "gray";


if (difficulty === "easy") {
  easyLeaderboard.push(score);
  easyLeaderboard.sort((a, b) => b - a);
  easyLeaderboard = easyLeaderboard.slice(0, 5);
}
else if (difficulty === "hard") {
  hardLeaderboard.push(score);
  hardLeaderboard.sort((a, b) => b - a);
  hardLeaderboard = hardLeaderboard.slice(0, 5);
}
}




function drawStars() { //draws the stars at random positions and sizes
noStroke();


for (let s of stars) {
  let sparkle = sin(frameCount*s.speed)*80;
  let brightness = constrain(s.base + sparkle, 80, 255);


  fill(brightness);
  circle(s.x, s.y, s.size);
}
}




function drawPlanets() { //draws the planets in the background with their respective settings
 for (let p of planets) {
   drawingContext.globalAlpha = p.opacity;
   image(p.img, p.x, p.y, p.size, p.size);
   p.x -= p.speed;
   if (p.x < -p.size) {
     p.x = width + p.size;
     p.y = random(height);
     p.img = random(planetImgs);
     p.size = random(40, 110);
   }
 }
 drawingContext.globalAlpha = 1.0;
}




function drawHUD() { //draws the heads-up display, mainly the score and hearts remaining
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




function showTitleScreen() { //sets rocket settings and displays the title screen, along with the logic for choosing a difficulty mode
 rocket.x = 90;
 rocket.y = height/2;
 rocket.vel.y = 0;
 rocket.rotation = 0;
 rocket.rotationSpeed = 0;
 rocket.tint = "white";


 fill("white");
 textFont("monospace");
 textAlign(CENTER, CENTER);
 textSize(64);
 text("SPACE JAM", width/2, height/2 - 120);
 textSize(24);
 text("Avoid the aliens. Survive as long as possible.", width/2, height/2 + 55);
  textSize(28);
 if (difficulty === "easy") {
   fill("lime");
 }
 else {
   fill("white");
 }
 text("EASY", width/2 - 100, height/2 + 20);
 if (difficulty === "hard") {
   fill("red");
 }
 else {
   fill("white");
 }
 text("HARD", width/2 + 100, height/2 + 20);


 fill("white");
 textSize(18);
 text("Press 1 for Easy     Press 2 for Hard", width/2, height/2 + 80);
 text("Press SPACE to Start", width/2, height/2 + 120);


 if (kb.pressed("1")) {
   difficulty = "easy";
   difficultySpeedBonus = 2;
   difficultySpawnBonus = 20;
 }
 if (kb.pressed("2")) {
   difficulty = "hard";
   difficultySpeedBonus = 5;
   difficultySpawnBonus = 45;
 }
 if (kb.pressed("space")) {
   startGame();
 }
}




function showGameOver() { //displays the game over screen and displays the correct updated leaderboard
fill("white");
textFont("monospace");
textAlign(CENTER, CENTER);


textSize(52);
text("GAME OVER", width/2, 95);


textSize(24);
text("FINAL SCORE: " + score, width/2, 155);


textSize(26);
if (difficulty === "easy") {
  text("EASY LEADERBOARD:", width/2, 220);
}
else {
  text("HARD LEADERBOARD:", width/2, 220);
}
let currentLeaderboard;
if (difficulty === "easy") {
  currentLeaderboard = easyLeaderboard;
}
else {
  currentLeaderboard = hardLeaderboard;
}


for (let i = 0; i < 5; i++) {
  let s = currentLeaderboard[i] || 0;
  text((i + 1) + ". " + s, width/2, 270 + i*32);
}


textSize(18);
text("PRESS SPACE TO RESTART", width/2, height - 35);


if (kb.pressed("space")) {
  restartGame();
}
}




function restartGame() { //resets all the variables and sprite positions, removes the aliens and brings up the title screen again
lives = 3;
score = 0;
gameOver = false;
isInvis = false;
invisTimer = 0;
alienTimer = 0;
alienSpeed = 3;
hitCooldown = 0;
powerupTimer = 0;


for (let alien of aliens) {
  alien.remove();
}
aliens = [];


for (let pu of powerups) {
 pu.remove();
}
powerups = [];


rocket.x = 90;
rocket.y = height/2;
rocket.vel.y = 0;
rocket.vel.x = 0;
rocket.rotation = 0;
rocket.rotationSpeed = 0;
rocket.tint = "white";


screen = "title";
}