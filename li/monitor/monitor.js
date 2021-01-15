import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

customElements.define('li-monitor', class LiMonitor extends LiElement {
    static get properties() { return { pref: { type: Object }, startTime: { type: Object }, frame: { type: Number }, fps: { type: String }, memory: { type: String } } }

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

            }
            .monitor {
                display: flex;
                flex-direction: column;
                justify-content: center;
                width: 180px;
                height: 40px;
                padding: 2px;
            }
        `;
    }

    render() {
        return html`
            <div class="monitor">
                <div class="monitor">fps: ${this.fps}</div>
                <div class="monitor">memory: ${this.memory}</div>
            </div>
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this.frame = 0;
        let perf = this.perf = window.performance || {};
        if (!perf && !perf.memory) perf.memory = { usedJSHeapSize: 0 };
        if (perf && !perf.memory) perf.memory = { usedJSHeapSize: 0 };
        this.startTime = performance.now();
        this.tick();
    }

    tick() {
        let time = performance.now();
        this.frame++;
        if (time - this.startTime > 1000) {
            let ms = this.perf.memory.usedJSHeapSize;
            this.memory = this.bytesToSize(ms, 2);
            this.fps = (this.frame / ((time - this.startTime) / 1000)).toFixed(1);
            this.startTime = time;
            this.frame = 0;
        }
        requestAnimationFrame(() => this.tick());
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
