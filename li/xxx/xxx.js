import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

customElements.define('li-xxx', class LiXXX extends LiElement {
    render() {
        return html`
            <h2>Misc DEMO:</h2>
            <hr>
            <p><a target="_blank" href="../life/index.html">Games of Life</a></p>
            <p><a target="_blank" href="../life/index-2.html">Games of Life with FPS and Memory monitor</a></p>
            <p><a target="_blank" href="../monitor/index.html">Fireworks with FPS and Memory monitor</a></p>
            <div>..................................................................................</div>
            <p><a target="_blank" href="../layout-scheme/index.html">Scheme Designer (demo-1)</a></p>
            <p><a target="_blank" href="../layout-scheme/index-2.html">Scheme Designer (demo-2)</a></p>
            <p><a target="_blank" href="../layout-scheme/index-3.html">Scheme Designer (demo-3)</a></p>
            <div>..................................................................................</div>
            <p><a target="_blank" href="../accordion/index.html">Accordion (simple open)</a></p>
            <p><a target="_blank" href="../accordion/index-2.html">Accordion (multi open)</a></p>
            <div>..................................................................................</div>
            <p><a target="_blank" href="../dropdown/index.html">Dropdown (click right mouse)</a></p>
            <p><a target="_blank" href="../dropdown/index-2.html">Dropdown (click right mouse or press button)</a></p>
            <div>..................................................................................</div>
            <p><a target="_blank" href="../chart-apex/index.html">Chart-Apex (apexcharts.js)</a></p>
            <div>..................................................................................</div>
        `;
    }
});
