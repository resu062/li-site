import { html, css, svg } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

let ROWS, COLS, FRACTION, BOARD = [], _BOARD = [], first = true;
const isAlive = ((row, col) => { return BOARD && BOARD[row] && BOARD[row][col] && BOARD[row][col].alive || false });
const liveNighbourCount = (row, col) => {
    return isAlive(row - 1, col - 1) + isAlive(row - 1, col) + isAlive(row - 1, col + 1)
        + isAlive(row, col - 1) + isAlive(row, col + 1)
        + isAlive(row + 1, col - 1) + isAlive(row + 1, col) + isAlive(row + 1, col + 1);
}
const willLive = (row, col) => {
    let neighbours = liveNighbourCount(row, col);
    return neighbours === 3 || neighbours === 2 && isAlive(row, col);
}
const generateBoardState = (liveFunc) => {
    _BOARD = [];
    for (let row = 0; row < ROWS; row++) {
        let newRow = []
        for (let col = 0; col < COLS; col++) newRow.push({ alive: liveFunc(row, col) });
        _BOARD.push(newRow);
        if (first) BOARD.push(newRow);
    }
    first = false;
    for (let row = 0; row < ROWS; row++)
        for (let col = 0; col < COLS; col++) {
            BOARD[row][col].alive = _BOARD[row][col].alive;
            BOARD[row][col].hasAlive = BOARD[row][col].hasAlive || _BOARD[row][col].alive;
        }
}
const randomBoardState = () => { return generateBoardState(function () { return Math.random() < FRACTION }) }

customElements.define('li-life', class LiLife extends LiElement {
    static get properties() {
        return {
            rows: { type: Number, default: 100 },
            cols: { type: Number, default: 100 },
            size: { type: Number, default: 10 },
            fraction: { type: Number, default: .2 }
        }
    }

    constructor() {
        super();
        ROWS = this.rows, COLS = this.cols, FRACTION = this.fraction;
        randomBoardState();
    }

    static get styles() {
        return css`
            svg rect { stroke: lightgray; fill: lightyellow; }
            svg rect.haslive { fill: white; }
            svg rect.alive { fill: gray; }
        `;
    }

    render() {
        return html`
            <svg width="${this.cols * this.size}" height="${this.rows * this.size}">
                ${BOARD.map((row, r) => row.map((col, c) => svg`<rect class="${col.alive ? 'alive' : ''} ${col.hasAlive ? 'haslive' : ''}" 
                    x="${c * this.size}" y="${r * this.size}" width="${this.size}" height="${this.size}"/>`))}        
            </svg> 
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this.loop();
    }

    loop() {
        requestAnimationFrame(() => {
            generateBoardState(willLive);
            this.requestUpdate();
            requestAnimationFrame(() => this.loop());
        })
    }
});