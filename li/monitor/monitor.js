import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

customElements.define('li-monitor', class LiMonitor extends LiElement {
    static get properties() { return { startTime: { type: Date }, frame: { type: Number }, fps: { type: String } } }

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
                width: 130px;
                height: 50px;
                padding: 2px;
            }
        `;
    }

    render() {
        return html`
            <div class="monitor">fps: ${this.fps}</div>
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this.frame = 0;
        this.startTime = Date.now();
        this.tick();
    }

    tick() {
        let time = Date.now();
        this.frame++;
        if (time - this.startTime > 1000) {
            this.fps = (this.frame / ((time - this.startTime) / 1000)).toFixed(1);
            this.startTime = time;
            this.frame = 0;
        }
        requestAnimationFrame(() => this.tick());
    }
});
