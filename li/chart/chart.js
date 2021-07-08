import { LiElement, html, css, svg } from '../../li.js';

import 'https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js';

customElements.define('li-chart', class LiChart extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'line', list: ['line', 'bar', 'pie', 'radar', 'doughnut', 'polarArea'] },
            data: { type: Object },
            options: { type: Object, default: {} },
        }
    }

    static get styles() {
        return css`
            :host {
                display: block;
                position: relative;
                width: 100%;
            }
        `;
    }

    render() {
        return html`
            <canvas ref="canvas" style="max-width: 100%"></canvas>
        `;
    }

    get defOptions() { return { responsive: true, maintainAspectRatio: false } }

    updated(changedProperties) {
        if (this.hasFirstInit) {
            let update = false;
            changedProperties.forEach((oldValue, propName) => update = ['type', 'data', 'options'].includes(propName));
            if (update) this.init();
        } else if (this.type && this.data) {
            this.canvas = this.$refs.canvas;
            this.ctx = this.canvas.getContext('2d');
            this.init();
            this.hasFirstInit = true;
        }
    }

    init() {
        if (this.chart?.destroy) this.chart.destroy();
        this.chart = new Chart(this.ctx, {
            type: this.type,
            data: this.data,
            options: { ...this.defOptions, ...this.options }
        });
    }
});
