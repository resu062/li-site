import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

customElements.define('li-monitor', class LiMonitor extends LiElement {
    static get properties() {
        return {
            monitorWidth: { type: Number, default: 180 },
            barHeight: { type: Number, default: 10 },
            second: { type: String, default: '' },
            fps: { type: String, default: '' },
            memory: { type: String, default: '' },
            _fpsMax: { type: Number, default: 60 },
            _fpsArr: { type: Array, default: [] },
            _memoryMax: { type: Number, default: 0 },
            _memoryArr: { type: Array, default: [] },
            _frame: { type: Number, default: 0 },
            _startTime: { type: Object },
            _perf: { type: Object }
        }
    }

    static get styles() {
        return css`
            :host {
                font-family: sans-serif;
                border: 1px solid gray;
                background: lightgray;
                box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
                position: fixed;
                bottom: 0;
                right: 0;
                margin: 8px;
                z-index: 9;
                padding: 2px;

            }
            .monitor {
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 2px;
            }
            .horizontal {
                display: flex;
            }
            .bars {
                justify-content: flex-end; 
                align-items: flex-end;
            }
            .bar {
                border:solid 1px gray;
                margin-right:1px;
            }
        `;
    }

    render() {
        return html`
            <div class="monitor" style="width:${this.monitorWidth}px">
                <div class="horizontal" style="justify-content: space-between; margin-bottom: 2px;">
                    <div style="color: gray">sec: ${this.second}</div>
                    <div>${this.fps} fps</div>
                </div>
                <div class="horizontal bars" style="height:${this.barHeight}px">
                    ${this._fpsArr.map(f => html`<div class="bar" style="height:${f * this.barHeight / this._fpsMax}px"></div>`)}
                </div>
                <div class="horizontal" style="justify-content: flex-end; margin: 2px 0;">${this.memory}</div>
                <div class="horizontal bars" style="height:${this.barHeight}px">
                    ${this._memoryArr.map(m => html`<div class="bar" style="height:${m * this.barHeight / this._memoryMax}px"></div>`)}
                </div>
            </div>
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this._second = performance.now();
        let perf = this._perf = window.performance || {};
        if (!perf && !perf.memory) perf.memory = { usedJSHeapSize: 0 };
        if (perf && !perf.memory) perf.memory = { usedJSHeapSize: 0 };
        this._startTime = performance.now();
        this.tick();
    }

    tick() {
        requestAnimationFrame(() => this.tick());
        let time = performance.now();
        this._frame++;
        if (time - this._startTime > 500) {
            this.second = ((time - this._second) / 1000).toFixed(0);
            let ms = this._perf.memory.usedJSHeapSize;
            this.memory = this.bytesToSize(ms, 2);
            this._memoryMax = ms > this._memoryMax ? ms : this._memoryMax;
            this._memoryArr.push(ms);
            if (this._memoryArr.length > this.monitorWidth / 3) this._memoryArr = this._memoryArr.splice(-this.monitorWidth / 3);
            this.fps = (this._frame / ((time - this._startTime) / 500) * 2).toFixed(1);
            this._fpsArr.push(this.fps);
            if (this._fpsArr.length > this.monitorWidth / 3) this._fpsArr = this._fpsArr.splice(-this.monitorWidth / 3);
            this._startTime = time;
            this._frame = 0;
        }
    }

    bytesToSize(bytes, nFractDigit) {
        if (bytes == 0) return 'n/a';
        let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        nFractDigit = nFractDigit !== undefined ? nFractDigit : 0;
        let precision = Math.pow(10, nFractDigit);
        let i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
    }
});
