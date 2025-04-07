const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions dynamically for fullscreen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
let bird = { x: 50, y: 150, width: 30, height: 30, gravity: 0.25, lift: -7, velocity: 0 };
let pipes = [];
let score = 0;
let highScore = 0; // Variable to store the highest score

// Pipe variables
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 2;
let pipeTimer = 0;
const pipeInterval = 90;

// Preload textures
const birdImage = new Image();
birdImage.src = 'bird.png';
birdImage.onload = () => {
    console.log('bird.png loaded successfully');
    assetsLoaded++;
};
birdImage.onerror = () => {
    console.error('Failed to load bird.png');
    assetsLoaded++;
};

const pipeImage = new Image();
pipeImage.src = 'pipe.png';
pipeImage.onload = () => assetsLoaded++;
pipeImage.onerror = () => assetsLoaded++;

let assetsLoaded = 0;

// Add keyboard control
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        bird.velocity = bird.lift;
    }
});

// Draw bird with circular clipping and texture
function drawBird() {
    if (birdImage.complete && birdImage.naturalWidth > 0) {
        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    } else {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(
            bird.x + bird.width / 2,
            bird.y + bird.height / 2,
            bird.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.closePath();
    }
}

// Update bird position
function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    }
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = 'black';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

// Update pipes
function updatePipes() {
    pipeTimer++;
    if (pipeTimer >= pipeInterval) {
        const topHeight = Math.random() * (canvas.height / 2 - pipeGap / 2) + canvas.height / 4;
        const bottomHeight = canvas.height - pipeGap - topHeight;
        pipes.push({ x: canvas.width, top: topHeight, bottom: bottomHeight });
        pipeTimer = 0;
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

// Check for collisions
function checkCollisions() {
    for (const pipe of pipes) {
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
        ) {
            resetGame();
            break;
        }
    }
}

// Reset game
function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    pipeTimer = 0;
}

// Update score
function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            score++;
            pipe.scored = true;
        }
    });

    if (score > highScore) {
        highScore = score; // Update high score if the current score is higher
    }

    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60); // Display the high score
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    updateBird();

    drawPipes();
    updatePipes();

    checkCollisions();
    updateScore();

    requestAnimationFrame(gameLoop);
}

// Start the game after assets are loaded
function startGame() {
    if (assetsLoaded === 2) {
        gameLoop();
    } else {
        requestAnimationFrame(startGame);
    }
}

startGame();
