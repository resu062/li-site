import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../button/button.js';

'use strict';

const COLS = 15;
const ROWS = 30;
const BLOCK_SIZE = 30;
const LINES_PER_LEVEL = 10;
const COLORS = [
    'none',
    'cyan',
    'blue',
    'orange',
    'yellow',
    'green',
    'purple',
    'red'
]
Object.freeze(COLORS);
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
Object.freeze(SHAPES);
const KEY = {
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    P: 80
}
Object.freeze(KEY);
const POINTS = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    SOFT_DROP: 1,
    HARD_DROP: 2,
}
Object.freeze(POINTS);
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
Object.freeze(LEVEL);

let canvas, ctx, canvasNext, ctxNext, account, requestId, board, time;
let accountValues = { score: 0, level: 0, lines: 0 }

const moves = {
    [KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
    [KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
    [KEY.DOWN]: p => ({ ...p, y: p.y + 1 }),
    [KEY.SPACE]: p => ({ ...p, y: p.y + 1 }),
    [KEY.UP]: p => board.rotate(p)
}
function initNext() {
    ctxNext.canvas.width = 4 * BLOCK_SIZE;
    ctxNext.canvas.height = 4 * BLOCK_SIZE;
    ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}
function addEventListener() {
    document.addEventListener('keydown', event => {
        if (event.keyCode === KEY.P) {
            pause();
        }
        if (event.keyCode === KEY.ESC) {
            gameOver();
        } else if (moves[event.keyCode]) {
            event.preventDefault();
            let p = moves[event.keyCode](board.piece);
            if (event.keyCode === KEY.SPACE) {
                while (board.valid(p)) {
                    account.score += POINTS.HARD_DROP;
                    board.piece.move(p);
                    p = moves[KEY.DOWN](board.piece);
                }
            } else if (board.valid(p)) {
                board.piece.move(p);
                if (event.keyCode === KEY.DOWN) {
                    account.score += POINTS.SOFT_DROP;
                }
            }
        }
    })
}
function resetGame() {
    account.score = 0;
    account.lines = 0;
    account.level = 0;
    board.reset();
    time = { start: 0, elapsed: 0, level: LEVEL[account.level] };
}
function play() {
    resetGame();
    time.start = performance.now();
    if (requestId) cancelAnimationFrame(requestId);
    animate();
}
function animate(now = 0) {
    time.elapsed = now - time.start;
    if (time.elapsed > time.level) {
        time.start = now;
        if (!board.drop()) {
            gameOver();
            return;
        }
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    board.draw();
    requestId = requestAnimationFrame(animate);
}
function gameOver() {
    cancelAnimationFrame(requestId);
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('GAME OVER', 1.8, 4);
}
function pause() {
    if (!requestId) {
        animate();
        return;
    }
    cancelAnimationFrame(requestId);
    requestId = null;
    ctx.fillStyle = 'black';
    ctx.fillRect(1, 3, 8, 1.2);
    ctx.font = '1px Arial';
    ctx.fillStyle = 'yellow';
    ctx.fillText('PAUSED', 3, 4);
}

let url = import.meta.url;
customElements.define('li-tetris', class LiTetris extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: 'TETRIS' }
        }
    }

    firstUpdated() {
        super.firstUpdated();

        canvas = this.$id.board;
        ctx = canvas.getContext('2d');
        canvasNext = this.$id.next;
        ctxNext = canvasNext.getContext('2d');

        account = new Proxy(accountValues, {
            set: (target, key, value) => {
                target[key] = value;
                this.$update();
                return true;
            }
        })

        board = new Board(ctx, ctxNext);
        addEventListener();
        initNext();

        play();
    }

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            <li-layout-app sides="360,360,1,1" fill="#9f731350">

                <div slot="app-top" style="font-size:xx-large;display:flex;align-items: center; justify-content: center;">
                    <img src="${url.replace('tetris.js', 'li.png')}" style="max-width:48px;max-height:48px;padding:4px">
                     ... TETRIS ...
                    <img src="${url.replace('tetris.js', 'li.png')}" style="max-width:48px;max-height:48px;padding:4px">
                </div>

                <div slot="app-left" style="display:flex;flex-direction:column; align-items: strech; justify-content: center;height:100%">
                    <div style="flex:1"></div>
                    <li-button width="auto" height="128px" >1</li-button>
                    <div style="display:flex;align-items: center; justify-content: center;">
                        <li-button width="auto" height="128px" style="flex:1">2</li-button>
                        <li-button width="auto" height="128px" style="flex:1">3</li-button>
                    </div>
                    <li-button width="auto" height="128px" >4</li-button>
                </div>

                <div slot="app-main" style="display:flex;align-items: center; justify-content: center;height:100%">
                    <canvas id="board" class="game-board" style="border: 4px solid lightgray;border-radius:8px"></canvas>
                </div>

                <div slot="app-right" style="display:flex;flex-direction:column; align-items: strech; justify-content: center;height:100%;font-size:large;">
                    <div style="margin:16px;font-size:large;">Score: ${accountValues.score}</div>
                    <div style="margin:16px;font-size:large;">Lines: ${accountValues.lines}</div>
                    <div style="margin:16px;font-size:large;">Level: ${accountValues.level}</div>
                    <canvas id="next" class="next" style="width:100px"></canvas>
                    <div style="flex:1"></div>
                    <li-button width="auto" height="128px" >1</li-button>
                    <div style="display:flex;align-items: center; justify-content: center;">
                        <li-button width="auto" height="128px" style="flex:1">2</li-button>
                        <li-button width="auto" height="128px" style="flex:1">3</li-button>
                    </div>
                    <li-button width="auto" height="128px" >4</li-button>
                </div>

            </li-layout-app>
        `
    }
})

class Board {
    ctx;
    ctxNext;
    grid;
    piece;
    next;
    requestId;
    time;
    constructor(ctx, ctxNext) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
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
            account.score += this.getLinesClearedPoints(lines);
            account.lines += lines;
            if (account.lines >= LINES_PER_LEVEL) {
                account.level++;
                account.lines -= LINES_PER_LEVEL;
                time.level = LEVEL[account.level];
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
                    this.ctx.fillRect(x, y, 1, 1);
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
        return (account.level + 1) * lineClearPoints;
    }
}

class Piece {
    x;
    y;
    color;
    shape;
    ctx;
    typeId;
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
                    this.ctx.fillRect(this.x + x, this.y + y, 1, 1);
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
        this.x = this.typeId === 4 ? 4 : 3;
    }
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes + 1);
    }
}
