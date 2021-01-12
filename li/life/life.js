import { html, css, svg } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

let ROWS = 1000, COLS = 1000, FRACTION = 0.2, BOARD = [], _BOARD = [], first = true;
function isAlive(row, col) {
    if (BOARD && BOARD[row] && BOARD[row][col])
        return BOARD[row][col].alive;
    return false;
}
function liveNighbourCount(row, col) {
    return isAlive(row - 1, col - 1) + isAlive(row - 1, col) + isAlive(row - 1, col + 1)
        + isAlive(row, col - 1) + isAlive(row, col + 1)
        + isAlive(row + 1, col - 1) + isAlive(row + 1, col) + isAlive(row + 1, col + 1);
}
function willLive(row, col) {
    let alive = isAlive(row, col);
    let neighbours = liveNighbourCount(row, col);
    return neighbours === 3 || neighbours === 2 && alive;
}
function setBoardState() {
    for (let row = 0; row < ROWS; row++)
        for (let col = 0; col < COLS; col++) {
            BOARD[row][col].alive = _BOARD[row][col].alive;
            BOARD[row][col].hasAlive = BOARD[row][col].hasAlive || _BOARD[row][col].alive;
        }
}
function generateBoardState(liveFunc) {
    _BOARD = [];
    for (let row = 0; row < ROWS; row++) {
        let newRow = []
        for (let col = 0; col < COLS; col++)
            newRow.push({ alive: liveFunc(row, col)});
        _BOARD.push(newRow);
        if (first) BOARD.push(newRow);
    }
    first = false;
}
function randomBoardState() {
    return generateBoardState(function() {
        return Math.random() < FRACTION;
    });
}

customElements.define('li-life', class LiLife extends LiElement {
    static get properties() {
        return {
            rows: { type: Number, default: 100 },
            cols: { type: Number, default: 100 },
            size: { type: Number, default: 10 },
            duration: { type: Number, default: 10 },
            fraction: { type: Number, default: 0.2 },
            colorAlive: { type: String, default: 'gray' },
            colorHaslive: { type: String, default: 'white' }
        }
    }

    render() {
        return html`
            <style>
                svg rect { stroke: lightgray; fill: lightyellow; }
                svg rect.haslive { fill: white; }
                svg rect.alive { fill: gray; }
            </style>
            <svg width="${this.cols*this.size}" height="${this.rows*this.size}">
                ${BOARD.map((row,r) => row.map((col,c) =>{
                    return svg`<rect class="${col.alive ? 'alive' : ''} ${col.hasAlive ? 'haslive' : ''}" x="${c*this.size}" y="${r*this.size}" width="${this.size}" height="${this.size}" @click="${this.toggleCell}" @mouseenter="${this.toggleCell}"/>`
                }))}        
            </svg> 
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this.initProps();
            setBoardState(randomBoardState());
            this.tick();
            this.requestUpdate();
        }, 100);
    }
    initProps() {
        ROWS = this.rows;
        COLS = this.cols;
        FRACTION = this.fraction;
    }
    toggleCell(event) {
        if (event?.type == 'mouseenter' && event?.button == 1
            || event?.type == 'click' && event?.button == 0) {
            let cell = event.target;
            setCellState(cell, !cell.classList.contains('alive'));
        }
    }
    tick() {
        requestAnimationFrame(() => {
            setBoardState(generateBoardState(willLive));
            this.requestUpdate();
            setTimeout(() => this.tick(), this.duration);
        })
    }
});
