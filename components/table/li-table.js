import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import './src/tabulator.js';

class LiTable extends LitElement {
    static get properties() {
        return { options: { type: Object } }
    }

    constructor() {
        super();
        let prop = {
            options: undefined
        }
        for (let i in prop) this[i] = prop[i];
    }

    static get styles() {
        return css`

        `;
    }
 
    render() {
        return html`
            <link rel="stylesheet" href="./src/tabulator.min.css">
            <div id="table"></div>
        `;
    }

    firstUpdated() {
        this.hidden = true;
        this.table = new Tabulator(this.shadowRoot.getElementById('table'), this.options);
        setTimeout(() => {
            this.hidden = false;
        }, 10);
    }
}

customElements.define('li-table', LiTable);
