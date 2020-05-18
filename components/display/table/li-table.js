import { LitElement, html, css } from '../../../lib/lit-element/lit-element.js';
import './src/tabulator.js';

class LiTable extends LitElement {
    static get properties() {
        return { options: { type: Object }, label: { type: String }, str: { type: String, list: ['001', '002', '003']} }
    }

    constructor() {
        super();
        let prop = {
            options: undefined, label: 'Label', str: '001'
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
            <div id="label">${this.label}</div>
            <div id="table"></div>
        `;
    }

    firstUpdated() {
        this.hidden = true;
        this.$props = LiTable.properties
        this.$ = function(id) {
            if (id) return this.shadowRoot.getElementById(id);
            return [...this.shadowRoot.children].filter(element => element.id);
        }
        this.$table = new Tabulator(this.shadowRoot.getElementById('table'), this.options);
        setTimeout(() => {
            this.hidden = false;
        }, 300);
    }
}

customElements.define('li-table', LiTable);
