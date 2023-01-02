//DOM Elements
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const p1Name = document.getElementById('p1-name')
const p2Name = document.getElementById('p2-name')
const score1 = document.getElementById('player1-score')
const score2 = document.getElementById('player2-score')
const p1UserSel = document.getElementById('p1-user')
const p1BotSel = document.getElementById('p1-bot')
const tbP1Name = document.getElementById('player1-name')
const p2UserSel = document.getElementById('p2-user')
const p2BotSel = document.getElementById('p2-bot')
const tbP2Name = document.getElementById('player2-name')
const btnStart = document.getElementById('start-btn')
const winnerScreen = document.getElementById('winner-screen')
const startScreen = document.getElementById('start-menu')
const btnReset = document.getElementById('reset-btn')
const btnSave = document.getElementById('save-btn')
const ballSpeedSlider = document.getElementById('ball-speed')
const botDifficultySlider = document.getElementById('bot-difficulty')
const paddleSpeedSlider = document.getElementById('paddle-speed')
const settingScreen = document.getElementById('setting-menu')
const btnSetting = document.getElementById('setting-btn')

//Game settings
const MAX_BOUNCE_ANGLE = 70
const MAX_SCORE = 10
const FIRST_SHOT_SPEED = 4
const canvasSize = 1000
const paddleSize = { 'w':20, 'h':200 }
let renderSpeed = 100
let ballSpeed = 15
let paddleSpeed = 10
let botPaddleSpeed = 10
let lastFrameTime = 0
let gameStopped = false
let demoRunning = true
let firstShot = true
let p1IsBot = true
let p2IsBot = true

const paddle1 = {
  'x': 0,
  'y': canvasSize/2 - paddleSize.h/2, //Starting position halfwau
  'direction': 0,                     //-10 for up and 10 for down
  'h': paddleSize.h,
  'w': paddleSize.w
}

const paddle2 = {
  'x': 980,
  'y': canvasSize/2 - paddleSize.h/2, //Starting position halfwau
  'direction': 0,                     //-10 for up and 10 for down
  'h': paddleSize.h,
  'w': paddleSize.w
}

const ball = {
  'x': canvasSize/2,
  'y': canvasSize/2,
  'direction': -1 * ballSpeed / FIRST_SHOT_SPEED, //-1 for left, +1 for right (halved for the first shot)
  'angle': getRandomBallAngle(),
  'size': 10
}

/*********** Event Listeners **********/
window.addEventListener('load', ()=> {
  setGameSettings()
  demoRunning = true
  window.requestAnimationFrame(gameLoop)
})

btnSetting.addEventListener('click', () => {
  settingScreen.classList.remove('hide')
  startScreen.classList.add('hide')
})

//Settings submit 
btnSave.addEventListener('click', e => {
  e.preventDefault()
  setGameSettings();
  startScreen.classList.remove('hide')
  settingScreen.classList.add('hide')
})

//User selecting # of players
p1UserSel.addEventListener('change', () => {
  tbP1Name.value = "PLAYER 1"
  tbP1Name.disabled = false
})
p1BotSel.addEventListener('change', () => {
  tbP1Name.value = "PONG BOT"
  tbP1Name.disabled = true
})
p2UserSel.addEventListener('change', () => {
  tbP2Name.value = "PLAYER 2"
  tbP2Name.disabled = false
})
p2BotSel.addEventListener('change', () => {
  tbP2Name.value = "PONG BOT"
  tbP2Name.disabled = true
})

//Start button is clicked
btnStart.addEventListener('click', ()=> {
  gameStopped = true
  demoRunning = false
  startGame(false)
  //hide start screen
  startScreen.classList.add('hide')
})

//reset button is clicked
btnReset.addEventListener('click', () => {
  winnerScreen.classList.add('hide')
  startScreen.classList.remove('hide')
  demoRunning = true
  startGame(true)
})

//Keyboard events
window.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault()
      //p1 is human and p2 is bot set the arrows as controls
      if (!p1IsBot && p2IsBot) 
        paddle1.direction = -1 * paddleSpeed
      else 
        paddle2.direction = -1 * paddleSpeed
      break
    case 'ArrowDown':
      e.preventDefault()
      if (!p1IsBot && p2IsBot)
        paddle1.direction = paddleSpeed
      else
        paddle2.direction = paddleSpeed
      break
    case 'w':
      e.preventDefault()
      if (!p1IsBot && !p2IsBot)
        paddle1.direction = -1 * paddleSpeed
      break
    case 's':
      e.preventDefault()
      if (!p1IsBot && !p2IsBot)
      paddle1.direction = paddleSpeed
      break
  }
})
window.addEventListener('keyup', (e) => {
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault()
      if (!p1IsBot && p2IsBot)
        paddle1.direction = 0
      else 
        paddle2.direction = 0
      break
    case 'ArrowDown':
      e.preventDefault()
      if (!p1IsBot && p2IsBot)
        paddle1.direction = 0
      else
        paddle2.direction = 0
      break
    case 'w':
      e.preventDefault()
      if (!p1IsBot && !p2IsBot)
        paddle1.direction = 0
      break
    case 's':
      e.preventDefault()
      if (!p1IsBot && !p2IsBot)
        paddle1.direction = 0
      break
  }
})

/************* Game Functions *******************/

function setGameSettings() {

  //Set the speed of the ball
  switch (ballSpeedSlider.value) {
    case '1':
      ballSpeed = 10
      break
    case '2':
      ballSpeed = 15
      break
    case '3':
      ballSpeed = 20
      break
  }

  //Set the speed of the paddle
  switch (paddleSpeedSlider.value) {
    case '1':
      paddleSpeed = 7
      break
    case '2':
      paddleSpeed = 10
      break
    case '3':
      paddleSpeed = 15
      break
  }

  //Set the speed of the bot
  switch (botDifficultySlider.value) {
    case '1':
      botPaddleSpeed = ballSpeed * (1/3)
      break
    case '2':
      botPaddleSpeed = ballSpeed * (2/3)
      break
    case '3':
      botPaddleSpeed = ballSpeed
      break
  }

}

function startGame(isDemo) {

  //Check if any players have to be bots
  if (p1UserSel.checked == true && !isDemo) 
    p1IsBot = false
  else
    p1IsBot = true

  if (p2UserSel.checked == true && !isDemo) 
    p2IsBot = false
  else
    p2IsBot = true

  //Set the name 
  if (!isDemo) {
    p1Name.innerText = tbP1Name.value.toUpperCase()
    p2Name.innerText = tbP2Name.value.toUpperCase()
  }
  else {
    p1Name.innerText = 'PONG BOT'
    p2Name.innerText = 'PONG BOT'
  }
  
  //Reset the paddles
  paddle1.y = canvasSize/2 - paddleSize.h/2
  paddle1.direction = 0
  paddle2.y = canvasSize/2 - paddleSize.h/2
  paddle2.direction = 0

  //Reset the ball
  ball.x = canvasSize/2
  ball.y = canvasSize/2
  ball.direction = -1 * ballSpeed / FIRST_SHOT_SPEED
  ball.angle = getRandomBallAngle()

  //Reset the score
  score1.innerText = 0
  score2.innerText = 0

  firstShot = true
  gameStopped = false
  window.requestAnimationFrame(gameLoop) 

}

function gameLoop(timestamp) {
  
  //Check if the game was stopped
  if (gameStopped) {
    return
  }

  window.requestAnimationFrame(gameLoop) //Call the gameloop function recursively

  //Check if enough time has passed to move the ball
  const timeSinceLastFrame = (timestamp - lastFrameTime) / 1000 //Time between now and last frame rendered 
  if (timeSinceLastFrame < 1/renderSpeed) return //Check if enough time has passed to render next frame
  lastFrameTime = timestamp //Update the time since the last frame
  
  //redraw the board
  clearBoard()
  drawCenterLine()
  drawPaddle(paddle1.x, paddle1.y)
  drawPaddle(paddle2.x, paddle2.y)
  drawBall(ball.x, ball.y)

  //Calculate next paddle position if it is bot
  if (p1IsBot) updatePongBotPaddlePos1()
  else movePaddle1()
  if (p2IsBot) updatePongBotPaddlePos2()
  else movePaddle2()

  calculateNextBallPosition()

}

function endGame(winnerName) {

  gameStopped = true

  //Restart the game if its in demo mode
  if(demoRunning) {
    startGame(true)
    return
  }

  document.getElementById('winner-name').innerText = winnerName
  winnerScreen.classList.remove('hide')

}

/******** Canvas fuctions ***********/

function clearBoard() {
  ctx.clearRect(0, 0, 1000, 1000)
}

function drawCenterLine() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
  for (let i = 0; i < canvasSize; i+=80) {
    ctx.fillRect(canvasSize/2 - 10, i, 20, 40)
  }
}

function drawPaddle(x, y) {
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(x, y, paddleSize.w, paddleSize.h)
}

function drawBall(x, y) {
  ctx.beginPath()
  ctx.fillStyle = "#FFFFFF"
  ctx.arc(x, y, ball.size, 0, 2*Math.PI)
  ctx.fill()
}

/********* Ball functions *************/

function calculateNextBallPosition() {

  //Update the position of the ball based on the angle
  ball.x = ball.direction * Math.cos(toRadians(ball.angle)) + ball.x
  ball.y = ball.direction * Math.sin(toRadians(ball.angle)) + ball.y

  //Hits player1s paddle
  if((ball.x <= (paddle1.w + ball.size)) && (ball.y > paddle1.y) && (ball.y < paddle1.y + paddle1.h) && (ball.direction < 0)) {
    ball.direction *= -1
    //Calculate the distance the ball is from the center of the paddle
    let yPosOnPaddle = paddle1.h / 2 - (ball.y - paddle1.y)
    ball.angle = calculateBounceAngle(yPosOnPaddle) * -1
    //Double the speed after the first hit
    if (firstShot) {
      ball.direction *= FIRST_SHOT_SPEED
      firstShot = false
    }
  }
  //Hits the back wall on p1 side... point scored by p2 
  else if((ball.x <= (ball.size)) && (ball.direction < 0)) {
    score2.innerText = parseFloat(score2.innerText) + 1
    if (score2.innerText == MAX_SCORE) endGame(p2Name.innerText)
    resetBall()
    ball.direction = ballSpeed / FIRST_SHOT_SPEED
  }

  //Hits player2s paddle
  if(ball.x >= (canvasSize - paddle2.w - ball.size) && (ball.y > paddle2.y) && (ball.y < paddle2.y + paddle2.h) && ball.direction > 0) {
    ball.direction *= -1
    //Calculate the distance the ball is from the center of the paddle
    let yPosOnPaddle = paddle2.h / 2 - (ball.y - paddle2.y)
    ball.angle = calculateBounceAngle(yPosOnPaddle)
    //Double the speed after the first hit
    if (firstShot) {
      ball.direction *= FIRST_SHOT_SPEED 
      firstShot = false
    }
  }
  //Hits the back wall on p1 side... point scored by p1 
  else if(ball.x >= (canvasSize - ball.size) && ball.direction > 0) {
    score1.innerText = parseFloat(score1.innerText) + 1
    if (score1.innerText == MAX_SCORE) endGame(p1Name.innerText)
    resetBall()
    ball.direction = -1 * ballSpeed / FIRST_SHOT_SPEED
  }

  //Hits the top and bottom wall
  if(ball.y <= (0 + ball.size) || ball.y >= (canvasSize - ball.size)) {
    ball.angle *= -1
  }

}

function calculateBounceAngle(yPosOnPaddle) {
  //Returns an angle between 0 and 80, depending on how far the ball is from the center of the paddle
  return (yPosOnPaddle / (paddleSize.h / 2)) * MAX_BOUNCE_ANGLE
}

function resetBall() {
  firstShot = true
  ball.angle = getRandomBallAngle()
  ball.x = canvasSize/2
  ball.y = canvasSize/2
}

function getRandomBallAngle() {
  //Random number between -45 and +45
  let angle = (Math.floor(Math.random() * 90) - 45)
  return angle
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

/*********** Paddle functions ******************/

function movePaddle1() {
  //Check if the paddle is hitting the top or bottom wall before moving
  if (paddle1.y > 0 && paddle1.direction < 0)
    paddle1.y += paddle1.direction
  else if (paddle1.direction > 0 && (paddle1.y + paddle1.h < canvasSize)) 
    paddle1.y += paddle1.direction
}

function movePaddle2() {
  //Check if the paddle is hitting the top or bottom wall before moving
  if (paddle2.y > 0 && paddle2.direction < 0)
    paddle2.y += paddle2.direction
  else if (paddle2.direction > 0 && (paddle2.y + paddle2.h < canvasSize)) 
    paddle2.y += paddle2.direction 
}

function updatePongBotPaddlePos1() {

  //Trigger when the ball is moving towards the bots paddle (negative for left direction)
  if (ball.direction < 0) {

    //Calculate the balls final position based on trajectory
    //First calc horizontal distance from the paddle
    let dX = ball.x - paddleSize.w 
    //Calc distance on y from where the ball currently is
    let dY = Math.tan(toRadians(ball.angle)) * dX
    //Get actual position on y where the ball will be 
    let predictedY = ball.y - dY

    //Check if the center of the paddle is above the predicted pos of the ball
    if (paddle1.y + (paddle1.h / 2) > predictedY + 50) {
      paddle1.direction = botPaddleSpeed * -1
      movePaddle1()
    }
    if (paddle1.y + (paddle1.h / 2) < predictedY + 50) {
      paddle1.direction = botPaddleSpeed
      movePaddle1()
    }

  }

}

function updatePongBotPaddlePos2() {

  //Trigger when the ball is moving towards the bots paddle (positive for right direction)
  if (ball.direction > 0) {

    //Calculate the balls final position based on trajectory
    //First calc horizontal distance from the paddle
    let dX = canvasSize - paddleSize.w - ball.x
    //Calc distance on y from where the ball currently is
    let dY = Math.tan(toRadians(ball.angle)) * dX
    //Get actual position on y where the ball will be 
    let predictedY = ball.y + dY

    //Check if the center of the paddle is above the predicted pos of the ball +/- an allowance
    if (paddle2.y + (paddle2.h / 2) > (predictedY + 50)) {
      paddle2.direction = botPaddleSpeed * -1
      movePaddle2()
    }
    if (paddle2.y + (paddle2.h / 2) < (predictedY - 50)) {
      paddle2.direction = botPaddleSpeed
      movePaddle2()
    }

  }

}

