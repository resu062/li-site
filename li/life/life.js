import { LiElement, html, css, svg } from '../../li.js';


let ROWS, COLS, FRACTION, BOARD = [], _BOARD = [], first = true;
const isAlive = ((row, col) => { return BOARD && BOARD[row] && BOARD[row][col] && BOARD[row][col].alive || false });
const willLive = (row, col) => {
    let neighbours = isAlive(row - 1, col - 1) + isAlive(row - 1, col) + isAlive(row - 1, col + 1)
        + isAlive(row, col - 1) + isAlive(row, col + 1)
        + isAlive(row + 1, col - 1) + isAlive(row + 1, col) + isAlive(row + 1, col + 1);
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
        }
}
const randomBoardState = () => { return generateBoardState(function () { return Math.random() < FRACTION }) }

customElements.define('li-life', class LiLife extends LiElement {
    static get properties() {
        return {
            rows: { type: Number, default: 80 },
            cols: { type: Number, default: 80 },
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
            svg rect { fill: #f0f0f0; }
            svg rect.alive { fill: #777; }
        `;
    }

    render() {
        return html`
            <svg width="${this.cols * this.size}" height="${this.rows * this.size}">
                ${BOARD.map((row, r) =>
                    svg`<g>
                        ${row.map((col, c) => svg`<rect class="${col.alive ? 'alive' : ''}" x="${c * this.size}" y="${r * this.size}" width="${this.size-1}" height="${this.size-1}"/>`)}
                    </g >`
                )}
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
