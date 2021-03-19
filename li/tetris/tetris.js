import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../../lib/tocca/Tocca.js';

'use strict';

let soundEnabled = true;
const COLS = 15;
const ROWS = 30;
const BLOCK_SIZE = 24;
const LINES_PER_LEVEL = 10;
const SLIT = 0.05;
const COLORS = [
    'none',
    '#e36bae',      // I
    '#19d3da',      // J
    '#a8dda8',      // L
    '#f1e189',      // []
    '#00917c',      // S
    '#ff7171',      // T
    '#3d7ea6'       // Z
]
const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],
    [[4, 4], [4, 4]],
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
]
const KEY = {
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    P: 80
}
const POINTS = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
}
const LEVEL = {
    0: 800,
    1: 720,
    2: 630,
    3: 550,
    4: 470,
    5: 380,
    6: 300,
    7: 220,
    8: 130,
    9: 100,
    10: 80,
    11: 80,
    12: 80,
    13: 70,
    14: 70,
    15: 70,
    16: 50,
    17: 50,
    18: 50,
    19: 30,
    20: 30,
    // 29+ is 20ms
}

const moves = {
    [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: p => board.rotate(p)
}

customElements.define('li-tetris', class LiTetris extends LiElement {
    static get properties() {
        return {
            _partid: { type: String, default: 'tetris' },
            label: { type: String, default: 'TETRIS' },
            musicEnabled: { type: Boolean, default: true, save: true },
            soundEnabled: { type: Boolean, default: true, save: true },
            account: { type: Object, default: { score: 0, lines: 0, level: 0 } }
        }
    }

    firstUpdated() {
        super.firstUpdated();

        this.canvas = this.$id.board;
        this.ctx = this.canvas.getContext('2d');
        this.canvasNext = this.$id.next;
        this.ctxNext = this.canvasNext.getContext('2d');
        this.board = new Board(this);
        this.addEventListener();
        this.initNext();
    }

    static get styles() {
        return css`
            :host {
                height: 100%;
                display: flex;
                justify-content: space-between;
                align-items: stretch;
            }
            .panel {
                display: flex;
                flex-direction: column;
                padding: 4px;
                border: 1px solid lightgray;
                width: 200px;
            }
            .item {
                margin: 16px;
                font-size: large;
            }
            .account {
                margin-top: 16px;
                font-size: small;
            }
            .btn {
                padding: 2px;
            }
            .cnts {
                flex: 1;
                margin: 2px;
                border: 1px solid lightgray;
                border-radius: 4px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: lightgray;
            }
        `;
    }

    render() {
        return html`
            <div class="panel">
                <div class="item" align="center" style="font-weight:700;text-decoration:underline">TETRIS</div>
                <li-button class="btn" width="auto" height="32" border="0" @click="${this._play}">Play</li-button>
                <li-button class="btn" width="auto" height="32" border="0" @click="${this.pause}">Pause</li-button>
                <li-button class="btn" width="auto" height="32" border="0" @click="${this._sound}" style="text-decoration: ${this.soundEnabled ? '' : 'line-through'}">Sound</li-button>
                <li-button class="btn" width="auto" height="32" border="0" @click="${this._music}" style="text-decoration: ${this.musicEnabled ? '' : 'line-through'}">Music</li-button>
                <div style="flex:1"></div>
                <div style="max-height:400px; flex: 10; display: flex;flex-direction: column;cursor:pointer;">
                    <div class="cnts" @mousedown="${(e) => this.down(e, KEY.UP)}" @touchstart="${(e) => this.touch(e, KEY.UP)}">up</div>
                    <div style="display:flex;flex-direction:row;flex:1">
                        <div class="cnts" @mousedown="${(e) => this.down(e, KEY.LEFT)}" @touchstart="${(e) => this.touch(e, KEY.LEFT)}">left</div>
                        <div class="cnts" @mousedown="${(e) => this.down(e, KEY.RIGHT)}" @touchstart="${(e) => this.touch(e, KEY.RIGHT)}">right</div>
                    </div>
                    <div class="cnts" @mousedown="${(e) => this.down(e, KEY.DOWN)}" @touchstart="${(e) => this.touch(e, KEY.DOWN)}">down</div>
                </div>
            </div>
            <canvas id="board" class="no-flex game-board" style="border: 18px solid transparent;box-shadow: inset 0 0 0 1px lightgray;"></canvas>
            <div class="panel">
                <div class="account">Score:${this.account.score}</div>
                <div class="account">Lines:${this.account.lines}</div>
                <div class="account">Level:${this.account.level}</div>
                <div class="account" style="display:flex;justify-content:center">
                    <canvas id="next" style="width:100px"></canvas>
                </div>
                <div style="flex:1"></div>
                <div style="max-height:400px; flex: 10; display: flex;flex-direction: column;cursor:pointer">
                    <div class="cnts" @mousedown="${(e) => this.down(e, KEY.UP)}" @touchstart="${(e) => this.touch(e, KEY.UP)}">up</div>
                    <div style="display:flex;flex-direction:row;flex:1">
                        <div class="cnts" @mousedown="${(e) => this.down(e, KEY.LEFT)}" @touchstart="${(e) => this.touch(e, KEY.LEFT)}">left</div>
                        <div class="cnts" @mousedown="${(e) => this.down(e, KEY.RIGHT)}" @touchstart="${(e) => this.touch(e, KEY.RIGHT)}">right</div>
                    </div>
                    <div class="cnts" @mousedown="${(e) => this.down(e, KEY.SPACE)}" @touchstart="${(e) => this.touch(e, KEY.SPACE)}">space</div>
                </div>
            </div>
        `
    }

    _play() {
        this.play();
        this.playMusic();
    }
    _sound() {
        soundEnabled = this.soundEnabled = !this.soundEnabled;
    }
    _music() {
        this.musicEnabled = !this.musicEnabled;
        this.playMusic();
    }
    playMusic = function () {
        if (this.themeMusic) {
            this.themeMusic.pause();
        }
        if (this.musicEnabled) {
            //if (!this.themeMusic) {
            this.themeMusic = new Audio('./music/TetrisTheme.mp3');
            this.themeMusic.volume = 0.05;
            this.themeMusic.loop = true;
            //}
            this.themeMusic.play();
        }
    }
    initNext() {
        this.ctxNext.canvas.width = 4 * BLOCK_SIZE;
        this.ctxNext.canvas.height = 4 * BLOCK_SIZE;
        this.ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
    }
    down(e, action) {
        e.preventDefault();
        if (action === KEY.LEFT || action === KEY.RIGHT || action === KEY.DOWN)
            this._timer = setInterval(() => {
                this.action(action);
            }, 100);
        else this.action(action);
    }
    touch(e, action) {
        e.preventDefault();
        if (action === KEY.LEFT || action === KEY.RIGHT || action === KEY.DOWN)
            this._timer = setInterval(() => {
                this.action(action);
            }, 100);
        else this.action(action);
    }
    action(action) {
        if (!this._gameStart) return;
        let p;
        if (action === KEY.UP) p = this.board.rotate(this.board.piece);
        else p = moves[action](this.board.piece);
        if (action === KEY.SPACE) {
            if (this.soundEnabled) {
                this.linedropeffect = new Audio('./music/drop.mp3');
                this.linedropeffect.volume = 0.15;
                this.linedropeffect.play();
            }
            while (this.board.valid(p)) {
                this.account.score += POINTS.HARD_DROP;
                this.board.piece.move(p);
                p = moves[KEY.DOWN](this.board.piece);
            }
        } else if (this.board.valid(p)) {
            this.board.piece.move(p);
            if (action === KEY.DOWN) {
                this.account.score += POINTS.SOFT_DROP;
            }
        }
        this.$update();
    }
    addEventListener() {
        document.addEventListener('touchend', event => {
            if (this._timer) clearInterval(this._timer);
        })
        document.addEventListener('mouseup', event => {
            if (this._timer) clearInterval(this._timer);
        })
        document.addEventListener('keydown', event => {
            if (event.keyCode === KEY.P) {
                this.pause();
            }
            if (event.keyCode === KEY.ESC) {
                this.gameOver();
            } else if (moves[event.keyCode]) {
                event.preventDefault();
                this.action(event.keyCode);
            }
        })
    }
    resetGame() {
        this.account.score = 0;
        this.account.lines = 0;
        this.account.level = 0;
        this.board.reset();
        this.time = { start: 0, elapsed: 0, level: LEVEL[this.account.level] };
        this.$update();
    }
    play() {
        this.resetGame();
        this.time.start = performance.now();
        if (this.requestId) cancelAnimationFrame(this.requestId);
        this.animate();
        this._gameStart = true;
    }
    animate(now = 0) {
        this.time.elapsed = now - this.time.start;
        if (this.time.elapsed > this.time.level) {
            this.time.start = now;
            if (!this.board.drop()) {
                this.gameOver();
                return;
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.board.draw();
        this.requestId = requestAnimationFrame(this.animate.bind(this));
    }
    gameOver() {
        this._gameStart = false;
        cancelAnimationFrame(this.requestId);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, COLS - 2, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.fillText('GAME OVER', COLS / 2 - 3, 4);
    }
    pause() {
        if (!this.requestId) {
            this.animate();
            return;
        }
        cancelAnimationFrame(this.requestId);
        this.requestId = null;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(1, 3, COLS - 2, 1.2);
        this.ctx.font = '1px Arial';
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillText('PAUSED', COLS / 2 - 2, 4);
    }
})

class Board {
    constructor(tet) {
        this.tet = tet;
        this.ctx = tet.ctx;
        this.ctxNext = tet.ctxNext;
        this.init();
    }
    init() {
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }
    reset() {
        this.grid = this.getEmptyGrid();
        this.piece = new Piece(this.ctx);
        this.piece.setStartingPosition();
        this.getNewPiece();
    }
    getNewPiece() {
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
        this.next.draw();
    }
    draw() {
        this.piece.draw();
        this.drawBoard();
    }
    drop() {
        let p = moves[KEY.DOWN](this.piece);
        if (this.valid(p)) {
            this.piece.move(p);
        } else {
            this.freeze();
            this.clearLines();
            if (this.piece.y === 0) return false;
            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartingPosition();
            this.getNewPiece();
        }
        return true;
    }
    lineClearPlay() {
        if (soundEnabled) {
            if (!this.linecleareffect) {
                this.linecleareffect = new Audio('./music/line.wav');
                this.linecleareffect.volume = 0.15;
            }
            this.linecleareffect.play();
        }
    }
    clearLines() {
        let lines = 0;
        this.grid.forEach((row, y) => {
            if (row.every(value => value > 0)) {
                lines++;
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
            }
        });
        if (lines > 0) {
            this.lineClearPlay();
            this.tet.account.score += this.getLinesClearedPoints(lines);
            this.tet.account.lines += lines;
            if (this.tet.account.lines >= LINES_PER_LEVEL) {
                this.tet.account.level++;
                this.tet.account.lines -= LINES_PER_LEVEL;
                this.tet.time.level = LEVEL[this.tet.account.level];
            }
        }
    }
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y = p.y + dy;
                return (
                    value === 0 ||
                    (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
                );
            });
        });
    }
    freeze() {
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.grid[y + this.piece.y][x + this.piece.x] = value;
                }
            });
        });
    }
    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value];
                    this.ctx.fillRect(x + SLIT, y + SLIT, 1 - SLIT, 1 - SLIT);
                }
            });
        });
    }
    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    insideWalls(x) {
        return x >= 0 && x < COLS;
    }
    aboveFloor(y) {
        return y <= ROWS;
    }
    notOccupied(x, y) {
        return this.grid[y] && this.grid[y][x] === 0;
    }
    rotate(piece) {
        let p = JSON.parse(JSON.stringify(piece));
        for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
            }
        }
        p.shape.forEach(row => row.reverse());
        return p;
    }
    getLinesClearedPoints(lines, level) {
        const lineClearPoints =
            lines === 1
                ? POINTS.SINGLE
                : lines === 2
                    ? POINTS.DOUBLE
                    : lines === 3
                        ? POINTS.TRIPLE
                        : lines === 4
                            ? POINTS.TETRIS
                            : 0;
        return (this.tet.account.level + 1) * lineClearPoints;
    }
}

class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    }
    spawn() {
        this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        this.x = 0;
        this.y = 0;
    }
    draw() {
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillRect(this.x + x + SLIT, this.y + y + SLIT, 1 - SLIT, 1 - SLIT);
                }
            });
        });
    }
    move(p) {
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
    }
    setStartingPosition() {
        this.x = this.typeId === 4 ? Math.round(COLS / 2) - 1 : Math.round(COLS / 2) - 2;
    }
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes + 1);
    }
}
