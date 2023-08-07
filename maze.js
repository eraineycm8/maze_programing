// Player class 
class Player {
  constructor(name, energy = 100, health = 100, items = [], life = 1, x = 0, y = 0) {
    this.name = name;
    this.energy = energy;
    this.health = health;
    this.items = items;
    this.life = life;
    this.x = x;
    this.y = y;
    this.direction = 'n';
  }

  setStartLocation(x,y){
    this.x = x;
    this.y = y;
    this.xInitial = x;
    this.yInitial = y;
  }

  setValues(){
    document.getElementById("energy").value = this.energy;
    document.getElementById("health").value = this.health;
    document.getElementById("items").value = this.items.length + "/" + 15;
    document.getElementById("life").value = this.life;
  }

  turnAroundLeft(){
    switch (this.direction) {
      case 'w':
        this.direction='s';
        break;
      case 's':
        this.direction='e';
          break;
      case 'e':
        this.direction='n';
        break;
      case 'n':
        this.direction='w';
        break;
    }
  }
  
  turnAroundRight(){
    switch (this.direction) {
      case 'w':
        this.direction='n';
        break;
      case 's':
        this.direction='w';
          break;
      case 'e':
        this.direction='s';
        break;
      case 'n':
        this.direction='e';
        break;
    }
  }

  getColumn(){
    return player.x / CELL_SIZE;
  }
  getRow(){
    return player.y / CELL_SIZE;
  }
  walk(){

    let px = this.x;
    let py = this.y;
  

    switch (this.direction) {
      case 'w':
          px = this.x - CELL_SIZE;
        break;
      case 'e':
          px = this.x + CELL_SIZE; 
          break;
      case 'n':
          py = this.y - CELL_SIZE;
        break;
      case 's':
          py = this.y + CELL_SIZE;
        break;
    }

    let x = px / CELL_SIZE;
    let y = py / CELL_SIZE;
    
    if (isValidMove(x, y)){
      this.x = Math.max(0, Math.min(px, WIDTH - CELL_SIZE));
      this.y = Math.max(0, Math.min(py, HEIGHT - CELL_SIZE));
    } else {
      this.health -= 5;
    }
    this.energy-=2;
    this.setValues();

    if (this.isAlive()){
      drawPlayer();
    }
    //-------------------------------------------------------------------------------
  }  

 async walkto(column,row) {
    while (this.isAlive() && (!(column == this.getColumn() && row == this.getRow()))) {
      await runCommandWithDelay(player.walk.bind(player));
    }
  }
  
  getPos(){
    return [this.getColumn(), this.getRow()];
  }

  getInfo() {
    return `Name: ${this.name}, Health: ${this.health}`;
  }

  isAlive(){
    if (this.energy>0 && this.health>0 && this.life>-1){
      return true;
    }else{
      this.itDied();
      fail();
    }
    return false;
  }

  itDied(){
    this.life--;
    this.energy = 100;
    this.health = 100;
    this.x = this.xInitial;
    this.y = this.yInitial;
  }


}

async function runCommandWithDelay(method) {
  await sleep(DELAY);
  await method();
}

async function run() {

  if (commands.length>0)  player.energy-=5;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    await runCommandWithDelay(command);
  }

  commands.splice(0, commands.length);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const player = new Player('TesteRobto');
const commands = [];

//Defining the conttants
const CELL_SIZE = 35;
const MARGIN = 20;
const N_COLUMNS = 17;
const N_ROWS = 7;
const DELAY = 500;

// Defining the dimensions of the canvas
const WIDTH = N_COLUMNS*CELL_SIZE +MARGIN;
const HEIGHT = N_ROWS*CELL_SIZE+MARGIN;

// Defining the colors
const C_MARGIN = '#333333';
const WAY = '#f57b42';
const WALL = '#000000';
const GREEN = '#7FFF00';
const PLAYER = '#0000FF';
const GRID_LINE = '#ccc';

// Defining the size of maze cells
const CELL_WIDTH = Math.floor(WIDTH / CELL_SIZE);
const CELL_HEIGHT = Math.floor(HEIGHT / CELL_SIZE);


// Creating the canvas element
const posCanvas = document.getElementById('mazeCanvas');
const canvas = document.createElement('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
posCanvas.appendChild(canvas);
canvas.classList.add('canvas');

// Getting the 2D rendering context
const ctx = canvas.getContext('2d');

// Generate the maze and initialize player coordinates
const maze = generateMaze();
const portals = [
  [0, 0],
  [(N_COLUMNS - 1) * CELL_SIZE, 0],
  [(N_COLUMNS - 1) * CELL_SIZE, (N_ROWS - 1) * CELL_SIZE],
  [0, (N_ROWS - 1) * CELL_SIZE]
];

// Function to generate the starting position of the player
var startArea = null; 
var finishArea = null;
var interval = null;
var multiple = 1;

// Function to generate the maze
function generateMaze() {
    
  const maze = Array.from({ length: CELL_HEIGHT }, () => Array(CELL_WIDTH).fill(1));
  
  const stack = [[0, 0]];
  maze[0][0] = 0;

  while (stack.length > 0) {
    const currentCell = stack[stack.length - 1];
    const [x, y] = currentCell;
    const neighbors = [];

    if (x > 1 && maze[y][x - 2] === 1) {
      neighbors.push([x - 2, y]);
    }
    if (y > 1 && maze[y - 2][x] === 1) {
      neighbors.push([x, y - 2]);
    }
    if (x < CELL_WIDTH - 2 && maze[y][x + 2] === 1) {
      neighbors.push([x + 2, y]);
    }
    if (y < CELL_HEIGHT - 2 && maze[y + 2][x] === 1) {
      neighbors.push([x, y + 2]);
    }

    if (neighbors.length > 0) {
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      const [nx, ny] = randomNeighbor;
      maze[ny][nx] = 0;
      maze[y + (ny - y) / 2][x + (nx - x) / 2] = 0;
      stack.push(randomNeighbor);
    } else {
      stack.pop();
    }
  }
  return maze;
}
function drawMaze(maze) {
  // Carregar a imagem de textura de tijolo
  const brickTexture = new Image();
  brickTexture.src = 'wall.png';

  const roadTexture = new Image();
  roadTexture.src = 'road.png';  

  const finishTexture = new Image();
  finishTexture.src = 'finish.png';    

  // Quando a imagem estiver carregada, desenhar a textura de tijolo
  brickTexture.onload = function() {
    roadTexture.onload = function () {
      finishTexture.onload = function () {
        
        ctx.fillStyle = C_MARGIN;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
        // Draw the letters (columns) at the top
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        for (let x = 0; x < CELL_WIDTH; x++) {
          const letter = String.fromCharCode(65 + x); // 'A', 'B', 'C', ...
          ctx.fillText(letter, x * CELL_SIZE + CELL_SIZE / 2 - 5 + MARGIN, CELL_SIZE / 2 - 2);
        }
    
        // Draw the numbers (rows) on the left side
        for (let y = 0; y < CELL_HEIGHT; y++) {
          const number = y + 1;
          ctx.fillText(number, 5, y * CELL_SIZE + CELL_SIZE / 2 + 5 + MARGIN);
        }
    
        for (let y = 0; y < CELL_HEIGHT; y++) {
          for (let x = 0; x < CELL_WIDTH; x++) {
            if (maze[y][x] === 1) {
              const pattern = ctx.createPattern(brickTexture, 'repeat'); // WALL
              ctx.fillStyle = pattern;
              ctx.fillRect(MARGIN + x * CELL_SIZE, MARGIN + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            } else {
              const pattern2 = ctx.createPattern(roadTexture, 'repeat'); // WAY
              ctx.fillStyle = pattern2;

              //ctx.fillStyle = WAY;
              ctx.fillRect(MARGIN + x * CELL_SIZE, MARGIN + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
              ctx.strokeStyle = GRID_LINE; // Color for grid lines
              ctx.lineWidth = 1;
              ctx.strokeRect(MARGIN + x * CELL_SIZE, MARGIN + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
          }
        }
    
        // Drawing the green areas in the corners
        const centerX = finishArea[0] + MARGIN + CELL_SIZE / 2;
        const centerY = finishArea[1] + MARGIN + CELL_SIZE / 2;
        
        ctx.fillStyle = GREEN;
        ctx.fillRect(finishArea[0] + MARGIN, finishArea[1] + MARGIN, CELL_SIZE, CELL_SIZE);
        
        ctx.fillStyle = PLAYER; // Cor do texto
        ctx.font = 'bold 24px Arial'; // Defina a fonte e o tamanho do texto
        ctx.textAlign = 'center'; // Centralizar o texto horizontalmente
        ctx.textBaseline = 'middle'; // Centralizar o texto verticalmente
        ctx.fillText('H', centerX, centerY); // Desenhe a letra "H" no centro        
/*
        ctx.fillStyle = GREEN;
        ctx.fillRect(finishArea[0] + MARGIN, finishArea[1] + MARGIN, CELL_SIZE, CELL_SIZE);*/

      };

    };
  };
}


function drawMazeOriginal(maze) {

  //
  const brickTexture = new Image();
  brickTexture.src = 'wall.png';
  //
  ctx.fillStyle = C_MARGIN;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);


  //ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
  //ctx.fillRect(WIDTH - CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
  //ctx.fillRect(WIDTH - CELL_SIZE, HEIGHT - CELL_SIZE, CELL_SIZE, CELL_SIZE);
  //ctx.fillRect(0, HEIGHT - CELL_SIZE, CELL_SIZE, CELL_SIZE);


  // Draw the letters (columns) at the top
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  for (let x = 0; x < CELL_WIDTH; x++) {
    const letter = String.fromCharCode(65 + x); // 'A', 'B', 'C', ...
    ctx.fillText(letter, x * CELL_SIZE + CELL_SIZE / 2 - 5 +MARGIN, CELL_SIZE / 2-2);
  }

  // Draw the numbers (rows) on the left side
  for (let y = 0; y < CELL_HEIGHT; y++) {
    const number = y + 1;
    ctx.fillText(number, 5, y * CELL_SIZE + CELL_SIZE / 2 + 5+MARGIN);
  }

  
  for (let y = 0; y < CELL_HEIGHT; y++) {
    for (let x = 0; x < CELL_WIDTH; x++) {
      if (maze[y][x] === 1) {
        /* ANTES DE COLOCAR FILTRO
        ctx.fillStyle = WALL;
        ctx.fillRect(MARGIN + x * CELL_SIZE, MARGIN +  y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        */
        // Quando a imagem estiver carregada, desenhar a textura de tijolo
        brickTexture.onload = function() {
          const pattern = ctx.createPattern(brickTexture, 'repeat');
          ctx.fillStyle = pattern;
          ctx.fillRect(MARGIN + x * CELL_SIZE, MARGIN + y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        };

      } else {
        ctx.fillStyle = WAY;
        ctx.fillRect(MARGIN + x * CELL_SIZE, MARGIN +  y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        ctx.strokeStyle = GRID_LINE; // Color for grid lines
        ctx.lineWidth = 1;
        ctx.strokeRect(MARGIN +  x * CELL_SIZE, MARGIN +  y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  // Drawing the green areas in the corners
  ctx.fillStyle = GREEN;
  ctx.fillRect(finishArea[0]+MARGIN, finishArea[1]+MARGIN, CELL_SIZE, CELL_SIZE);
}

// Function to draw the player on the canvas
function drawPlayer() {
  ctx.fillStyle = PLAYER;
  ctx.beginPath();
  //ctx.arc(player.x + 17+MARGIN, player.y + 17+MARGIN, 9, 0, 2 * Math.PI);
  ctx.arc(player.x + 17+MARGIN, player.y + 17+MARGIN, 9, 0, 2 * Math.PI);
  ctx.fill();

  // Desenha a seta com base na direção atual do jogador
  drawArrow(player.x + 17+MARGIN, player.y + 17+MARGIN, player.direction);
}

function drawArrow(x, y, direction) {
  line = 20;
  ctx.beginPath();
  ctx.arc(x, y, 17, 0, Math.PI * 2);
  ctx.moveTo(x, y);

  switch (direction) {
    case 'n':
      ctx.lineTo(x, y - line);
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x, y - 5);
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x, y - 5);
      break;
    case 's':
      ctx.lineTo(x, y + line);
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x, y + 5);
      ctx.moveTo(x + 5, y);
      ctx.lineTo(x, y + 5);
      break;
    case 'e':
      ctx.lineTo(x + line, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x + 5, y);
      break;
    case 'w':
      ctx.lineTo(x - line, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x - 5, y);
      ctx.moveTo(x, y + 5);
      ctx.lineTo(x - 5, y);
      break;
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0000FF'; // Azul
  ctx.stroke();
}


// Function to check if the movement is valid
function isValidMove(x, y) {
  retorno = true;
  if(x<0 || y<0 || x>=N_COLUMNS || y>=N_ROWS){
    return false;
  }
  // Check if it's a wall
  if (maze[y][x] === 1) {
    return false;
  }

  return true;
}

// block for command html
function turnAroundLeft(){
  addCommand(player.turnAroundLeft.bind(player), 'Vire a esquerda');
  //player.turnAroundLeft();
}

function turnAroundRight() {
  addCommand(player.turnAroundRight.bind(player), 'Vire a direita');
  //player.turnAroundRight();
}

function walk() {
  addCommand(player.walk.bind(player), 'Ande');  
  //player.walk();
}

function walkto() {
  let column = walkY.value.toUpperCase().charCodeAt(0) - 65;
  let row = walkX.value-1;
  addCommand(() => player.walkto(column, row), 'Ande até [' + walkY.value + '][' + walkX.value + ']');
}

function addCommand(method, command){
  for (let index = 0; index < multiple; index++) {
    commands.push(method);
  }
  multiple=1;
  textCommand.value = textCommand.value + command + '\n';
}

function xfactor(value) {
  multiple=value;  
  textCommand.value = textCommand.value + value + 'x ';
}

function itwon() {
  fx = finishArea[0] / CELL_SIZE;
  fy = finishArea[1] / CELL_SIZE;

  if (fx == player.getColumn() && fy == player.getRow()){
    const successModal = new bootstrap.Modal('#success', null);
    successModal.show();    
  }
}

function fail() {

  if (player.life>=0){
    player.setValues();
    textCommand.value = "Você morreu, mas ainda tem vidas \n Tente novamente\n";
  }else{
    okToIndex.removeAttribute('hidden');  
    okToContinue.hidden = true;  
  }
  const failModal = new bootstrap.Modal('#fail', null);
  failModal.show();
}

// Game loop
function gameLoop() {
  drawMaze(maze);
  drawPlayer(player.x, player.y);
  requestAnimationFrame(gameLoop);
  itwon();
}

function definePortals(){
  index = Math.floor(Math.random() * portals.length);
  startArea = portals[index];
  finishArea = portals[(index+2)%4];
}

function gameInitialize() {
  player.setValues();
  definePortals();
  player.setStartLocation(startArea[0], startArea[1]);

  gameLoop();
}

// Start the game loop
gameInitialize();