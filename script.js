// ==========================================
// GAME CONSTANTS & CONFIGURATION
// ==========================================
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const TILE_SIZE = 30;
const GRAVITY = 0.6;
const FRICTION = 0.8;
const MAX_FALL_SPEED = 12;

// Maps
const levelMapAscii = [
    "                                                                                                                                              ",
    "                                                                                                                                              ",
    "                                                                                                                                              ",
    "                                                                                                                                        F     ",
    "                                                    -      -     -               CCCCC                                                  F     ",
    "                                    CCCCC         -                                             C                                       F     ",
    "                                  -------       -                        =                  E                C              ===         F     ",
    "                     C       E                -                          =               =======                        ---             F     ",
    "         CC       -------  -----            -                            =                 C                  C                         F     ",
    "       ------                           C                                =             ---------         -------                        F     ",
    "                          E           -----                              = =====                                                        F     ",
    "  P                            =======                                   =                                                              F     ",
    "===================   =========   ============     ================================================    ======================================="
];

const MAP_ROWS = levelMapAscii.length;
const MAP_COLS = levelMapAscii[0].length;

// ==========================================
// PIXEL ANIMATION & SPRITES
// ==========================================
const PALETTE = {
    'R': '#e4000f', // Mario Red
    'B': '#6a4000', // Brown/Shoes
    'S': '#ffcea5', // Skin
    'T': '#000000', // Black
    'U': '#0040ff', // Overalls Blue
    'Y': '#f7d800', // Yellow buttons
    'W': '#ffffff', // White
    'C': '#000000',
    'A': '#000000'
};

const SPRITES = {
    MARIO_STAND: [
        "    RRRRR   ",
        "   RRRRRRRR ",
        "   BBBSSTB  ",
        "  BSBSSTSSB ",
        "  BSBSSSTSSB",
        "  BBSSSSB   ",
        "    SSSSSSS ",
        "   UURUUU   ",
        "  UUUURUUUU ",
        "  UUUUUURUUUU",
        "  SS UUUUU SS",
        "  SSS YU YSSS",
        "      UUUU   ",
        "    BBB  BBB ",
        "   BBBB  BBBB"
    ],
    MARIO_JUMP: [
        "    RRRRR   ",
        "   RRRRRRRR ",
        "   BBBSSTB  ",
        "  BSBSSTSSB ",
        "  BSBSSSTSSB",
        "  BBSSSSB   ",
        "    SSSSSSS ",
        "      RR U  ",
        "   UURRRUUU ",
        "  UUUURUUUU ",
        "  SSUUUUUU  ",
        "  SS UUU SU ",
        "      UU UU ",
        "    BBB BBB ",
        "   BBBB BBBB"
    ],
    GOOMBA: [
        "      B B     ",
        "     BB BB    ",
        "    BBBBBBB   ",
        "   BBBBBBBBB  ",
        "  BBBBBBBBBBB ",
        "  B B BBBB B  ",
        " BBWBBBBBBWBB ",
        " BCWWCBBBACWC ",
        " BBCWBBBBBCBB ",
        " BBBBBBBBBBBB ",
        "   Y Y  Y Y   ",
        "  YYYY  YYYY  ",
        " YYYYYY YYYYYY"
    ]
};

function drawSprite(ctx, pixels, x, y, width, height, facingLeft) {
    let pw = width / pixels[0].length;
    let ph = height / pixels.length;
    for (let r = 0; r < pixels.length; r++) {
        for (let c = 0; c < pixels[r].length; c++) {
            let char = pixels[r][c];
            if (char !== ' ') {
                ctx.fillStyle = PALETTE[char] || char;
                let px = facingLeft ? (pixels[r].length - 1 - c) * pw : c * pw;
                // Ceil helps fill the decimal pixel gaps to avoid tearing
                ctx.fillRect(Math.floor(x + px), Math.floor(y + r * ph), Math.ceil(pw), Math.ceil(ph));
            }
        }
    }
}

// ==========================================
// INPUT HANDLER
// ==========================================
class InputHandler {
    constructor() {
        this.keys = { ArrowLeft: false, ArrowRight: false, Space: false };
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.ArrowLeft = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.ArrowRight = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.Space = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.ArrowLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.ArrowRight = false;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.Space = false;
        });
    }
}

// ==========================================
// ENTITIES
// ==========================================
class GameObject {
    constructor(x, y, width, height) {
        this.x = x; this.y = y;
        this.width = width; this.height = height;
        this.vx = 0; this.vy = 0;
        this.markedForDeletion = false;
        this.facingLeft = false;
    }
}

class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 24, 30); // Mario's aspect ratio matches 24x30 roughly
        let slider = document.getElementById('speed-slider');
        this.speed = slider ? parseFloat(slider.value) : 5;
        this.jumpForce = 12;
        this.onGround = false;
    }

    update(input, level) {
        // Horizontal Movement
        if (input.keys.ArrowLeft) {
            this.vx -= 1.5;
            this.facingLeft = true;
            if (this.vx < -this.speed) this.vx = -this.speed;
        } else if (input.keys.ArrowRight) {
            this.vx += 1.5;
            this.facingLeft = false;
            if (this.vx > this.speed) this.vx = this.speed;
        } else {
            this.vx *= FRICTION;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Jump
        if (input.keys.Space && this.onGround) {
            this.vy = -this.jumpForce;
            this.onGround = false;
        }

        // Gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        // X collision tracking
        this.x += this.vx;
        this.handleCollisions(level, 'horizontal');

        // Y collision tracking
        this.y += this.vy;
        this.handleCollisions(level, 'vertical');
        
        // Boundaries
        if (this.x < 0) this.x = 0;       
        if (this.y > CANVAS_HEIGHT) this.markedForDeletion = true; // Pit death
    }

    handleCollisions(level, direction) {
        // Subtracted 0.1 from bounds to prevent collision logic from triggering due to floating point or exact adjacent positioning
        let startCol = Math.floor((this.x + 0.1) / TILE_SIZE);
        let endCol = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        let startRow = Math.floor((this.y + 0.1) / TILE_SIZE);
        let endRow = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        startCol = Math.max(0, startCol); endCol = Math.min(MAP_COLS - 1, endCol);
        startRow = Math.max(0, startRow); endRow = Math.min(MAP_ROWS - 1, endRow);

        if (direction === 'vertical') this.onGround = false;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                let tile = level.map[row][col];
                
                if (tile === 1 || tile === 2) { 
                    let tileX = col * TILE_SIZE, tileY = row * TILE_SIZE;
                    let tileW = TILE_SIZE, tileH = TILE_SIZE;
                    
                    if (direction === 'horizontal') {
                        if (this.vx > 0 && this.x + this.width > tileX && this.x < tileX) {
                            this.x = tileX - this.width;
                            this.vx = 0;
                        } else if (this.vx < 0 && this.x < tileX + tileW && this.x + this.width > tileX + tileW) {
                            this.x = tileX + tileW;
                            this.vx = 0;
                        }
                    } 
                    else if (direction === 'vertical') {
                        if (this.vy >= 0 && this.y + this.height > tileY && this.y < tileY) {
                            this.y = tileY - this.height;
                            this.vy = 0;
                            this.onGround = true;
                        } else if (this.vy < 0 && this.y < tileY + tileH && this.y + this.height > tileY + tileH) {
                            if (tile === 1) { // Hit Head on solid block
                                this.y = tileY + tileH;
                                this.vy = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    draw(ctx, cameraX) {
        let sprite = this.onGround ? SPRITES.MARIO_STAND : SPRITES.MARIO_JUMP;
        drawSprite(ctx, sprite, this.x - cameraX, this.y, this.width, this.height, this.facingLeft);
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y + 6, 24, 24); // Size Goomba slightly smaller and shifted down
        this.vx = -1.5;
        this.active = false;
    }

    update(level, camera) {
        if (camera && this.x < camera.x + CANVAS_WIDTH + 100) {
            this.active = true;
        }
        if (!this.active) return;
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

        this.x += this.vx;
        this.handleCollisions(level, 'horizontal');
        
        this.y += this.vy;
        this.handleCollisions(level, 'vertical');
        
        if (this.y > CANVAS_HEIGHT) this.markedForDeletion = true;
    }
    
    handleCollisions(level, direction) {
        let startCol = Math.floor((this.x + 0.1) / TILE_SIZE);
        let endCol = Math.floor((this.x + this.width - 0.1) / TILE_SIZE);
        let startRow = Math.floor((this.y + 0.1) / TILE_SIZE);
        let endRow = Math.floor((this.y + this.height - 0.1) / TILE_SIZE);

        startCol = Math.max(0, startCol); endCol = Math.min(MAP_COLS - 1, endCol);
        startRow = Math.max(0, startRow); endRow = Math.min(MAP_ROWS - 1, endRow);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                let tile = level.map[row][col];
                if (tile === 1 || tile === 2) {
                    let tileX = col * TILE_SIZE, tileY = row * TILE_SIZE, tileW = TILE_SIZE, tileH = TILE_SIZE;
                    if (direction === 'horizontal') {
                        if (this.vx > 0) { this.x = tileX - this.width; this.vx *= -1; } 
                        else if (this.vx < 0) { this.x = tileX + tileW; this.vx *= -1; }
                    } else if (direction === 'vertical') {
                        if (this.vy > 0) { this.y = tileY - this.height; this.vy = 0; } 
                        else if (this.vy < 0 && tile === 1) { this.y = tileY + tileH; this.vy = 0; }
                    }
                }
            }
        }
    }
    
    draw(ctx, cameraX) {
        let offset = Math.sin(Date.now() / 150) > 0;
        drawSprite(ctx, SPRITES.GOOMBA, this.x - cameraX, this.y + (offset ? 1.5 : 0), this.width, this.height, false);
    }
}

class Collectible extends GameObject {
    constructor(x, y) {
        super(x + 5, y + 5, 20, 20);
        this.baseY = this.y;
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        this.angle += 0.05;
        this.y = this.baseY + Math.sin(this.angle) * 5;
    }
    
    draw(ctx, cameraX) {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(Math.floor((this.x - cameraX) + this.width/2), Math.floor(this.y + this.height/2), this.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Flag extends GameObject {
    constructor(x, y) {
        super(x + 8, y, 14, TILE_SIZE);
    }
    update() {}
    draw(ctx, cameraX) {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(Math.floor(this.x - cameraX), Math.floor(this.y), this.width, this.height);
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(Math.floor(this.x - cameraX) - 15, Math.floor(this.y));
        ctx.lineTo(Math.floor(this.x - cameraX), Math.floor(this.y));
        ctx.lineTo(Math.floor(this.x - cameraX), Math.floor(this.y) + 15);
        ctx.fill();
    }
}

// ==========================================
// LEVEL & MAP
// ==========================================
class Level {
    constructor(asciiMap) {
        this.map = []; 
        this.items = [];
        this.playerSpawn = { x: 50, y: 50 };
        this.parseMap(asciiMap);
    }

    parseMap(asciiMap) {
        for (let row = 0; row < asciiMap.length; row++) {
            let rowData = [];
            for (let col = 0; col < asciiMap[row].length; col++) {
                let char = asciiMap[row][col];
                let posX = col * TILE_SIZE; let posY = row * TILE_SIZE;
                switch(char) {
                    case '=': rowData.push(1); break;
                    case '-': rowData.push(2); break;
                    case 'C': rowData.push(0); this.items.push(new Collectible(posX, posY)); break;
                    case 'F': rowData.push(0); this.items.push(new Flag(posX, posY)); break;
                    case 'E': rowData.push(0); this.items.push(new Enemy(posX, posY)); break;
                    case 'P': rowData.push(0); this.playerSpawn = {x: posX, y: posY}; break;
                    default: rowData.push(0); break;
                }
            }
            this.map.push(rowData);
        }
    }

    draw(ctx, cameraX) {
        let startCol = Math.floor(cameraX / TILE_SIZE);
        let endCol = startCol + Math.ceil(CANVAS_WIDTH / TILE_SIZE) + 1;
        startCol = Math.max(0, startCol); endCol = Math.min(MAP_COLS, endCol);

        for (let row = 0; row < this.map.length; row++) {
            for (let col = startCol; col < endCol; col++) {
                let x = col * TILE_SIZE - cameraX; let y = row * TILE_SIZE;
                if (this.map[row][col] === 1) {
                    ctx.fillStyle = '#c84b31';
                    ctx.fillRect(Math.floor(x), y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#2ecc71';
                    ctx.fillRect(Math.floor(x), y, TILE_SIZE, 6); 
                    ctx.strokeStyle = '#2d4263';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(Math.floor(x), y, TILE_SIZE, TILE_SIZE);
                } else if (this.map[row][col] === 2) {
                    ctx.fillStyle = '#e67e22';
                    ctx.fillRect(Math.floor(x), y, TILE_SIZE, TILE_SIZE / 2);
                    ctx.strokeStyle = '#873600';
                    ctx.strokeRect(Math.floor(x), y, TILE_SIZE, TILE_SIZE / 2);
                }
            }
        }
    }
}

// ==========================================
// CAMERA
// ==========================================
class Camera {
    constructor() { this.x = 0; }
    update(player) {
         let targetX = player.x - CANVAS_WIDTH / 2.5; 
         targetX = Math.max(0, targetX);
         let maxCameraX = (MAP_COLS * TILE_SIZE) - CANVAS_WIDTH;
         targetX = Math.min(targetX, maxCameraX);
         this.x += (targetX - this.x) * 0.1;
    }
}

// ==========================================
// GAME ENGINE
// ==========================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.uiStart = document.getElementById('screen-start');
        this.uiGameOver = document.getElementById('screen-gameover');
        this.scoreElem = document.getElementById('score');
        this.livesElem = document.getElementById('lives');
        
        this.uiPause = document.getElementById('screen-pause');
        this.uiHistory = document.getElementById('screen-history');
        this.uiWin = document.getElementById('screen-win');

        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-restart').addEventListener('click', () => this.start());
        if(document.getElementById('btn-next-level')) document.getElementById('btn-next-level').addEventListener('click', () => this.start());
        document.getElementById('btn-history-start').addEventListener('click', () => this.showHistory());
        
        document.getElementById('btn-pause').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-restart-pause').addEventListener('click', () => this.start());
        document.getElementById('btn-history').addEventListener('click', () => this.showHistory());
        document.getElementById('btn-history-close').addEventListener('click', () => {
            this.uiHistory.classList.add('hidden');
            if (this.state === 'START') this.uiStart.classList.remove('hidden');
            else if (this.state === 'PAUSED') this.uiPause.classList.remove('hidden');
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                this.togglePause();
            }
        });
        
        this.input = new InputHandler();
        this.state = 'START';
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.uiPause.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.uiPause.classList.add('hidden');
            this.uiHistory.classList.add('hidden');
            this.loop();
        }
    }

    showHistory() {
        this.uiStart.classList.add('hidden');
        this.uiPause.classList.add('hidden');
        this.uiHistory.classList.remove('hidden');
        
        let history = JSON.parse(localStorage.getItem('mario_history') || '[]');
        let content = document.getElementById('history-content');
        if (history.length === 0) {
            content.innerHTML = '<p style="text-align:center;">Chưa có lịch sử chơi nào.</p>';
        } else {
            let table = '<table><tr><th>Ngày chơi</th><th>Điểm số</th><th>Level</th></tr>';
            history.forEach(h => {
                table += `<tr><td>${h.date}</td><td>${h.score}</td><td>${h.level}</td></tr>`;
            });
            table += '</table>';
            content.innerHTML = table;
        }
    }

    saveHistory(outcome = 'Thua') {
        let history = JSON.parse(localStorage.getItem('mario_history') || '[]');
        history.unshift({
            date: new Date().toLocaleString(),
            score: this.score,
            level: outcome
        });
        if (history.length > 20) history.pop();
        localStorage.setItem('mario_history', JSON.stringify(history));
    }
    
    start() {
        this.state = 'PLAYING';
        let nameInput = document.getElementById('player-name');
        this.playerName = nameInput ? nameInput.value.trim() || 'Mario' : 'Mario';
        this.uiStart.classList.add('hidden');
        this.uiGameOver.classList.add('hidden');
        this.uiPause.classList.add('hidden');
        this.uiHistory.classList.add('hidden');
        if(this.uiWin) this.uiWin.classList.add('hidden');
        
        this.score = 0; this.lives = 3; this.updateHUD();
        this.enemiesDefeated = 0;
        
        this.level = new Level(levelMapAscii);
        this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
        this.camera = new Camera();
        
        if (this.requestId) cancelAnimationFrame(this.requestId);
        this.loop();
    }
    
    checkCollisions() {
        for (let i = 0; i < this.level.items.length; i++) {
            let item = this.level.items[i];
            if (this.player.x < item.x + item.width && this.player.x + this.player.width > item.x &&
                this.player.y < item.y + item.height && this.player.y + this.player.height > item.y) {
                    
                if (item instanceof Enemy) {
                    if (this.player.vy > 0 && this.player.y + this.player.height - this.player.vy <= item.y + 10) {
                        item.markedForDeletion = true;
                        this.player.vy = -this.player.jumpForce * 0.7; // Bounce
                        this.score += 100;
                        this.enemiesDefeated++;
                        this.updateHUD();
                    } else {
                        this.player.markedForDeletion = true;
                    }
                } else if (item instanceof Collectible) {
                    item.markedForDeletion = true;
                    this.score += 10;
                    this.updateHUD();
                } else if (item instanceof Flag) {
                    this.win();
                }
            }
        }
    }

    win() {
        this.state = 'WIN';
        let livesBonus = this.lives * 500;
        let total = this.score + livesBonus;
        
        if(this.uiWin) {
            this.uiWin.classList.remove('hidden');
            document.getElementById('win-base-score').innerText = this.score;
            document.getElementById('win-lives-bonus').innerText = livesBonus;
            document.getElementById('win-score').innerText = total;
        }
        this.score = total;
        this.saveHistory('Thắng');
    }
    
    updateHUD() {
        this.scoreElem.innerText = this.score;
        this.livesElem.innerText = this.lives;
    }

    update() {
        if (this.state !== 'PLAYING') return;
        
        this.player.update(this.input, this.level);
        this.level.items.forEach(i => i.update(this.level, this.camera));
        this.level.items = this.level.items.filter(i => !i.markedForDeletion);
        
        this.checkCollisions();
        this.camera.update(this.player);
        
        if (this.player.markedForDeletion) {
            this.lives--; this.updateHUD();
            if (this.lives > 0) {
                // Refresh level entirely so active enemies revert back to spawn
                this.level = new Level(levelMapAscii);
                this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);
                this.camera.x = 0;
            } else {
                this.state = 'GAMEOVER';
                this.saveHistory('Thua');
                let msg = document.getElementById('gameover-message');
                if (msg) msg.innerText = `Cảm ơn vì đã đến, ${this.playerName}!`;
                this.uiGameOver.classList.remove('hidden');
                document.getElementById('final-score').innerText = this.score;
                let fe = document.getElementById('final-enemies');
                if (fe) fe.innerText = this.enemiesDefeated || 0;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (this.state !== 'PLAYING') return;
        this.level.draw(this.ctx, this.camera.x);
        this.level.items.forEach(i => i.draw(this.ctx, this.camera.x));
        this.player.draw(this.ctx, this.camera.x);
    }

    loop() {
        this.update();
        this.draw();
        if (this.state === 'PLAYING') {
            this.requestId = requestAnimationFrame(() => this.loop());
        }
    }
}

window.onload = () => {
    const slider = document.getElementById('speed-slider');
    const valObj = document.getElementById('speed-val');
    if (slider && valObj) {
        slider.addEventListener('input', (e) => {
            valObj.innerText = e.target.value;
            // Cho phép cập nhật tốc độ real-time nếu đang chơi
            if (window.gameInstance && window.gameInstance.player) {
                window.gameInstance.player.speed = parseFloat(e.target.value);
            }
        });
    }
    window.gameInstance = new Game();
};
