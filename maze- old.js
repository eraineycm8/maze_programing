// Player class 
class Player {
  constructor(name, energy = 100, health = 100, items = [], life = 3) {
    this.name = name;
    this.energy = energy;
    this.health = health;
    this.items = items;
    this.life = life;
    this.x = 0;
    this.y = 0;
  }

  


  getInfo() {
    return `Name: ${this.name}, Health: ${this.health}`;
  }
}

const player = new Player('TesteRobto');

//Defining the conttants
const CELL_SIZE = 35;

// Defining the dimensions of the canvas
const WIDTH = 23*CELL_SIZE ;
const HEIGHT = 385; //11*CELL_SIZE;

// Defining the colors
const WAY = '#f57b42';
const WALL = '#000000';
const GREEN = '#00FF00';
const PLAYER = '#FFFF00';

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
const startAreas = [
  [0, 0],
  [WIDTH - CELL_SIZE, 0],
  [0, HEIGHT - CELL_SIZE],
  [WIDTH - CELL_SIZE, HEIGHT - CELL_SIZE]
];

/*const startArea = startAreas[Math.floor(Math.random() * startAreas.length)];
let playerX = Math.floor(Math.random()) + startArea[0];
let playerY = Math.floor(Math.random()) + startArea[1];*/

const startArea = startAreas[Math.floor(Math.random() * startAreas.length)];
let playerX = startArea[0];
let playerY = startArea[1];


// Function to generate the maze
function generateMaze() {
    
  //console.log(WIDTH+" w-h "+HEIGHT);
  //console.log(window.innerWidth+" w-h "+window.innerHeight);

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
  ctx.fillStyle = WAY;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Drawing the green areas in the corners
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, CELL_SIZE, CELL_SIZE);
  ctx.fillRect(WIDTH - CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
  ctx.fillRect(0, HEIGHT - CELL_SIZE, CELL_SIZE, CELL_SIZE);
  ctx.fillRect(WIDTH - CELL_SIZE, HEIGHT - CELL_SIZE, CELL_SIZE, CELL_SIZE);


  // Draw the letters (columns) at the top
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  for (let x = 0; x < CELL_WIDTH; x++) {
    const letter = String.fromCharCode(65 + x); // 'A', 'B', 'C', ...
    ctx.fillText(letter, x * CELL_SIZE + CELL_SIZE / 2 - 5, CELL_SIZE / 2);
  }

  // Draw the numbers (rows) on the left side
  for (let y = 0; y < CELL_HEIGHT; y++) {
    const number = y + 1;
    ctx.fillText(number, 5, y * CELL_SIZE + CELL_SIZE / 2 + 5);
  }

  for (let y = 0; y < CELL_HEIGHT; y++) {
    for (let x = 0; x < CELL_WIDTH; x++) {
      if (maze[y][x] === 1) {
        ctx.fillStyle = WALL;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      } else {
        ctx.strokeStyle = '#ccc'; // Color for grid lines
        ctx.lineWidth = 1;
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}


// Function to draw the player on the canvas
function drawPlayer(playerX, playerY) {
  ctx.fillStyle = PLAYER;
  ctx.beginPath();
  ctx.arc(playerX+17, playerY+17, 12, 0, 2 * Math.PI);
  ctx.fill();
}

// Function to check if the movement is valid
function isValidMove(x, y) {
  retorno = true;
  
  // Check if it's a wall
  if (maze[y][x] === 1) {
    retorno = false;
    return false;
  }

  return true;
}


// Function to handle keydown events
function handleKeyDown(event) {
  const { key } = event;

  px = playerX;
  py = playerY;

  if (key === 'ArrowLeft') {
    px = playerX - CELL_SIZE;
  } else if (key === 'ArrowRight') {
    px = playerX + CELL_SIZE;
  } else if (key === 'ArrowUp') {
    py = playerY - CELL_SIZE;
  } else if (key === 'ArrowDown') {
    py = playerY + CELL_SIZE;
  }

  
  x = px / CELL_SIZE;
  y = py / CELL_SIZE;
  
  if (isValidMove(x, y)){
    playerX = Math.max(0, Math.min(px, WIDTH - CELL_SIZE));
    playerY = Math.max(0, Math.min(py, HEIGHT - CELL_SIZE));
  } else {}
}





// Event listener for keydown events
document.addEventListener('keydown', handleKeyDown);

// Game loop
function gameLoop() {
  drawMaze(maze);
  drawPlayer(playerX, playerY);
  requestAnimationFrame(gameLoop);
}


function gameInitialize() {
  console.log(player.getInfo());
  gameLoop();
  
}

// Start the game loop
gameInitialize();
